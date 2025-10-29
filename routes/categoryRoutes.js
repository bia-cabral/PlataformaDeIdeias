const express = require("express");
const router = express.Router();
const categoryController = require("../src/controllers/categoryController");
const { authMiddleware } = require("../src/middleware/auth");

// ##### ROTAS DE API #####

// Rotas públicas
router.get("/", categoryController.getCategories);        // Listar categorias
router.get("/:id", categoryController.getCategory);       // Ver categoria específica

// Rotas protegidas (requerem autenticação)
router.post("/", authMiddleware, categoryController.saveCategory);      // Criar categoria
router.put("/:id", authMiddleware, categoryController.updateCategory);  // Atualizar categoria
router.delete("/:id", authMiddleware, categoryController.deleteCategory); // Deletar categoria

module.exports = router;