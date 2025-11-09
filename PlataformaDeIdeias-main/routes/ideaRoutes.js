const express = require("express");
const router = express.Router();
const ideaController = require("../src/controllers/ideaController");
const { authMiddleware, optionalAuthMiddleware } = require("../src/middleware/auth");

// ##### ROTAS DE API #####

// Rotas públicas
router.get("/", optionalAuthMiddleware, ideaController.getIdeias);     // Listar ideias
router.get("/:id", optionalAuthMiddleware, ideaController.getIdeia);   // Ver ideia específica

// Rotas protegidas (requerem autenticação)
router.post("/", authMiddleware, ideaController.saveIdeia);            // Criar ideia
router.put("/:id", authMiddleware, ideaController.updateIdeia);        // Atualizar ideia (apenas autor)
router.delete("/:id", authMiddleware, ideaController.deleteIdeia);     // Deletar ideia (apenas autor)

// Rotas de votação (requerem autenticação)
router.post("/:id/vote", authMiddleware, ideaController.voteIdeia);    // Votar em ideia
router.delete("/:id/vote", authMiddleware, ideaController.removeVote); // Remover voto

module.exports = router;