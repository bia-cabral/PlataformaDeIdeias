const express = require("express");
const router = express.Router();
const userController = require("../src/controllers/userController");
const { authMiddleware } = require("../src/middleware/auth");

// ##### ROTAS DE API #####

// Rotas públicas
router.post("/register", userController.saveUser); // Criar conta
router.post("/login", userController.loginUser);   // Login
router.get("/", userController.getUsers);          // Listar usuários (dados públicos)
router.get("/:id", userController.getUserProfile); // Ver perfil de usuário

// Rotas protegidas (requerem autenticação)
router.put("/:id", authMiddleware, userController.updateUser);    // Atualizar próprio perfil
router.delete("/:id", authMiddleware, userController.deleteUser); // Deletar própria conta

module.exports = router;