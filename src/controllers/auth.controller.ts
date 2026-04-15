import { Request, Response } from 'express';
import { pool } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createLog } from '../utils/logger';
import { getClientIp } from '../utils/ip';

const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

export const login = async (req: Request, res: Response) => {
  // Pega tanto 'email' quanto 'id' para suportar o formato do frontend
  const userIdentifier = req.body.email || req.body.id;
  const { password } = req.body;

  try {
    if (!userIdentifier || !password) {
      return res.status(400).json({ error: 'ID/Email e senha são obrigatórios.' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [userIdentifier]);
    const user = rows[0];

    if (!user) return res.status(400).json({ error: 'Usuário não encontrado' });
    
    // Mantemos a verificação de segurança (se a coluna não existir, ele ignora)
    if (user.is_active === false) return res.status(403).json({ error: 'Acesso bloqueado. Conta suspensa pelo administrador.' });

    // ATENÇÃO: Mudou de user.encrypted_password para user.password para espelhar o Banco de Dados
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1d' });
    
    let { rows: profiles } = await pool.query('SELECT * FROM profiles WHERE id = $1', [user.id]);
    
    if (profiles.length === 0) {
      const defaultName = user.email.split('@')[0];
      const insertRes = await pool.query(
        `INSERT INTO profiles (id, name, role, sector) VALUES ($1, $2, 'setor', 'Geral') RETURNING *`,
        [user.id, defaultName]
      );
      profiles = insertRes.rows;
    }

    const profile = profiles[0];
    
    // ATENÇÃO: Lê as permissões diretamente da coluna JSONB do perfil (em vez da tabela inexistente)
    const userPermissions = profile.permissions || [];
    
    await createLog(user.id, 'LOGIN', { message: 'Login realizado' }, getClientIp(req));

    res.json({ token, user, profile, permissions: userPermissions });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  const { email, password, name, role, sector } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const userCheck = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (userCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'ID de usuário já está em uso' });
    }
    
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    
    // ATENÇÃO: A inserção agora é feita na coluna 'password' correspondente ao banco
    const userRes = await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
      [email, encryptedPassword]
    );
    const newUserId = userRes.rows[0].id;

    await client.query(
      `INSERT INTO profiles (id, name, role, sector) VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, sector = EXCLUDED.sector`,
      [newUserId, name, role, sector]
    );

    const reqUser = (req as any).user;
    if (reqUser) {
        await createLog(reqUser.id, 'CREATE_USER', { target_user_id: newUserId, role, name }, getClientIp(req), client);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true });
  } catch (error: any) {
    try { await client.query('ROLLBACK'); } catch(e) {}
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};
