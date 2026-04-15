# ⚙️ COL - Backend API

Bem-vindo ao repositório do Backend do **Fluxo Royale**! 

Esta é a API RESTful construída para alimentar o nosso sistema ERP (Enterprise Resource Planning). Desenvolvido por mim, estudante da **FATEC de Adamantina**, este projeto representa o núcleo lógico, de segurança e de processamento de dados para a gestão corporativa avançada.

O objetivo desta API é fornecer endpoints rápidos, seguros e em tempo real para o controlo de stock, gestão de tarefas (Kanban), conciliação de viagens e administração de recursos humanos.

---

## ✨ Funcionalidades e Arquitetura

A arquitetura foi desenhada para ser escalável e segura, separando claramente as responsabilidades (Controllers, Routes, Middlewares e Utils):

- 🔒 **Segurança e Autenticação:** Camada de autenticação JWT, proteção com Rate Limiters para evitar ataques DDoS e validação rigorosa de dados de entrada.
- ⚡ **Comunicação em Tempo Real:** Integração com WebSockets (`Socket.io`) para atualizações instantâneas no Frontend (ex: notificações e painéis Kanban).
- 🤖 **Tarefas Automatizadas (Cron Jobs):** Sistema de rotinas em *background*, como a expiração automática de solicitações pendentes (`expireRequests.job`).
- 📦 **Módulos de Gestão:**
  - **Stock & Separações:** Controlo de reposições, saídas e cálculo de stock mínimo.
  - **Office & Tasks:** Gestão de quadros de tarefas e lembretes corporativos.
  - **Financeiro:** Conciliação de viagens e processamento de dados estruturados.
  - **Sistema e Permissões:** Controlo granular de acessos (RBAC - Role-Based Access Control) para diferentes perfis de utilizador.

---

## 🛠️ Tecnologias Utilizadas

O backend foi desenvolvido utilizando as ferramentas mais sólidas do ecossistema Node.js:

- [Node.js](https://nodejs.org/) & [Express](https://expressjs.com/) - *Motor da aplicação e roteamento*
- [TypeScript](https://www.typescriptlang.org/) - *Tipagem estática para um código previsível e à prova de erros*
- [Socket.io](https://socket.io/) - *Motor de comunicação bidirecional e tempo real*
- **Supabase / PostgreSQL** - *Base de dados relacional*
- **Bibliotecas Auxiliares:** Ferramentas para Logging estruturado, validação de esquemas e proteção de rotas.

---

## 🚀 Como rodar o projeto localmente

Caso queira testar a API no seu ambiente local, siga as instruções abaixo:

### Pré-requisitos
- [Node.js](https://nodejs.org/en/download/) instalado.
- Conta no Supabase / PostgreSQL configurada.

### Passo a Passo

**1. Clone o repositório:**
```sh
git clone [https://github.com/SEU_USUARIO/col-back.git](https://github.com/SEU_USUARIO/col-back.git)
cd col-back
