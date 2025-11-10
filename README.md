# Thinkers - Plataforma de Ideias

Uma plataforma para compartilhamento e votação de ideias construída com Node.js, Express, PostgreSQL e Handlebars.

## 🚀 Funcionalidades

- Autenticação de usuários (registro/login)
- Criar, editar e excluir ideias
- Votar (a favor/contra) em ideias
- Categorização de ideias
- Sistema de busca e filtros
- Perfil do usuário com suas ideias
- Interface responsiva

## 🛠️ Tecnologias Utilizadas

- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- Handlebars (Template Engine)
- Docker & Docker Compose
- Bootstrap 5

## ⚙️ Pré-requisitos

- Node.js
- Docker & Docker Compose
- PostgreSQL

## 🔧 Instalação

1. Clone o repositório:

```bash
git clone https://github.com/seu-usuario/thinkers.git
cd thinkers
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie os containers Docker:

```bash
docker-compose up --build
```

4. O sistema estará disponível em:
   http://localhost:3000

## 🗄️ Estrutura do Banco de Dados

- users: Armazena informações dos usuários
- category: Categorias das ideias
- idea: Armazena as ideias dos usuários
- vote: Registra os votos nas ideias

## 🔐 Recursos de Segurança

- Senhas criptografadas com bcrypt
- Proteção CSRF
- Validação de dados
- Autenticação via cookies
- Headers de segurança (Helmet)

## 📝 Documentação da API

Veja o arquivo API_README.md para documentação completa dos endpoints.
