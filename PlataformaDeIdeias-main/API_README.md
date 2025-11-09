# 💡 Plataforma de Ideias - API

API REST para uma plataforma de compartilhamento e votação de ideias.

## 🚀 Como executar

```bash
# Instalar dependências
npm install

# Subir os containers (banco + aplicação)
docker-compose up --build

# A API estará disponível em: http://localhost:3000
```

## 🔐 Autenticação

Para rotas protegidas, envie o header:
```
x-user-id: [ID_DO_USUARIO]
```

## 📚 Endpoints

### 👥 Usuários

#### `POST /api/users/register`
Criar nova conta
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "123456"
}
```

#### `POST /api/users/login`
Fazer login
```json
{
  "email": "joao@email.com",
  "password": "123456"
}
```

#### `GET /api/users`
Listar usuários

#### `GET /api/users/:id`
Ver perfil de usuário

#### `PUT /api/users/:id` 🔒
Atualizar próprio perfil
```json
{
  "name": "João Santos",
  "email": "joao.santos@email.com",
  "currentPassword": "123456",
  "newPassword": "nova123"
}
```

#### `DELETE /api/users/:id` 🔒
Deletar própria conta
```json
{
  "password": "123456"
}
```

### 📂 Categorias

#### `GET /api/categories`
Listar categorias

#### `GET /api/categories/:id`
Ver categoria específica

#### `POST /api/categories` 🔒
Criar categoria
```json
{
  "name": "Tecnologia"
}
```

#### `PUT /api/categories/:id` 🔒
Atualizar categoria
```json
{
  "name": "Tecnologia e Inovação"
}
```

#### `DELETE /api/categories/:id` 🔒
Deletar categoria (só se não houver ideias vinculadas)

### 💡 Ideias

#### `GET /api/ideas`
Listar ideias
- Query params: `category`, `page`, `limit`

#### `GET /api/ideas/:id`
Ver ideia específica

#### `POST /api/ideas` 🔒
Criar ideia
```json
{
  "title": "App para reciclagem",
  "description": "Um aplicativo que conecta pessoas que querem reciclar com pontos de coleta",
  "category_id": 1
}
```

#### `PUT /api/ideas/:id` 🔒
Atualizar ideia (apenas autor)
```json
{
  "title": "App de reciclagem inteligente",
  "description": "Aplicativo com IA para reconhecer tipos de material reciclável",
  "category_id": 1
}
```

#### `DELETE /api/ideas/:id` 🔒
Deletar ideia (apenas autor)

#### `POST /api/ideas/:id/vote` 🔒
Votar em ideia (não pode votar na própria)
```json
{
  "vote_value": 1
}
```
- `vote_value`: 0 = downvote, 1 = upvote

#### `DELETE /api/ideas/:id/vote` 🔒
Remover voto

## 🛡️ Regras de Segurança

### Usuários
- ✅ Senhas são criptografadas com bcrypt
- ✅ Usuário só pode editar/deletar próprio perfil
- ✅ Confirmação de senha obrigatória para exclusão

### Ideias  
- ✅ Usuário só pode editar/deletar próprias ideias
- ✅ Usuário não pode votar na própria ideia
- ✅ Validação de tamanhos (título: 50 chars, descrição: 254 chars)

### Categorias
- ✅ Categoria só pode ser deletada se não houver ideias vinculadas
- ✅ Nome único por categoria

## 📊 Estrutura do Banco

### `users`
- id, name, email, password, created_at

### `category` 
- id, name

### `idea`
- id, title, description, category_id, user_id, created_at

### `vote`
- id, user_id, idea_id, vote_value, created_at
- Constraint: usuário só pode votar uma vez por ideia

## 🔧 Exemplos de Uso

### 1. Criar usuário e fazer login
```bash
# Criar usuário
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@test.com","password":"123456"}'

# Fazer login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@test.com","password":"123456"}'
```

### 2. Criar categoria e ideia
```bash
# Criar categoria
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{"name":"Meio Ambiente"}'

# Criar ideia
curl -X POST http://localhost:3000/api/ideas \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{"title":"Horta comunitária","description":"Criar hortas em praças públicas","category_id":1}'
```

### 3. Votar em ideia
```bash
curl -X POST http://localhost:3000/api/ideas/1/vote \
  -H "Content-Type: application/json" \
  -H "x-user-id: 2" \
  -d '{"vote_value":1}'
```

## 📝 Notas

- 🔒 = Rota protegida (requer header `x-user-id`)
- Em produção, implemente JWT ao invés do header simples
- Todas as respostas são em JSON
- Códigos de status HTTP padrão são usados