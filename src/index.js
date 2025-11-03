const express = require("express");
const cors = require("cors");

const ideaRoutes = require("../routes/ideaRoutes");
const userRoutes = require("../routes/userRoutes");
const categoryRoutes = require("../routes/categoryRoutes");

require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Rotas de API
app.use("/api/ideas", ideaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);

// Rota raiz - informações da API
app.get("/", (req, res) => {
  res.json({
    message: "API da Plataforma de Ideias",
    version: "1.0.0",
    endpoints: {
      ideas: "/api/ideas",
      users: "/api/users",
      categories: "/api/categories"
    },
    authentication: {
      note: "Para rotas protegidas, envie o header 'x-user-id' com o ID do usuário autenticado",
      example: "x-user-id: 1"
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
  console.log(`� Documentação: http://localhost:${PORT}/`);
  console.log(`💡 Ideias: http://localhost:${PORT}/api/ideas`);
  console.log(`👥 Usuários: http://localhost:${PORT}/api/users`);
  console.log(`📂 Categorias: http://localhost:${PORT}/api/categories`);
});