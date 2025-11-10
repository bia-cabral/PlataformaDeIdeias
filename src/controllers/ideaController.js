const { Ideia, Category, User, Vote } = require("../models");
const { Op } = require("sequelize");

module.exports = {
  async saveIdeia(req, res) {
    const { title, description, category_id } = req.body;
    const authenticatedUserId = req.user?.id;

    try {
      if (!authenticatedUserId) {
        return res.status(401).json({
          error: "Você precisa estar logado para criar uma ideia",
        });
      }

      if (!title || !description || !category_id) {
        return res.status(400).json({
          error: "Título, descrição e categoria são obrigatórios",
        });
      }

      if (title.length > 50) {
        return res.status(400).json({
          error: "Título deve ter no máximo 50 caracteres",
        });
      }

      if (description.length > 254) {
        return res.status(400).json({
          error: "Descrição deve ter no máximo 254 caracteres",
        });
      }

      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({
          error: "Categoria não encontrada",
        });
      }

      const ideia = await Ideia.create({
        title,
        description,
        category_id: parseInt(category_id, 10),
        user_id: authenticatedUserId,
      });

      res.status(201).json({
        message: "Ideia criada com sucesso",
        ideia,
      });
    } catch (err) {
      console.error("Erro ao criar ideia:", err);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },

  async updateIdeia(req, res) {
    const { title, description, category_id } = req.body;
    const ideiaId = req.params.id;
    const authenticatedUserId = req.user?.id;

    try {
      if (!authenticatedUserId) {
        return res.status(401).json({
          error: "Você precisa estar logado para editar uma ideia",
        });
      }

      const ideia = await Ideia.findByPk(ideiaId);
      if (!ideia) {
        return res.status(404).json({
          error: "Ideia não encontrada",
        });
      }

      if (ideia.user_id !== authenticatedUserId) {
        return res.status(403).json({
          error: "Você só pode editar suas próprias ideias",
        });
      }

      if (!title || !description || !category_id) {
        return res.status(400).json({
          error: "Título, descrição e categoria são obrigatórios",
        });
      }

      if (title.length > 50) {
        return res.status(400).json({
          error: "Título deve ter no máximo 50 caracteres",
        });
      }

      if (description.length > 254) {
        return res.status(400).json({
          error: "Descrição deve ter no máximo 254 caracteres",
        });
      }

      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(400).json({
          error: "Categoria não encontrada",
        });
      }

      await Ideia.update(
        {
          title,
          description,
          category_id: parseInt(category_id, 10),
        },
        { where: { id: ideiaId } }
      );

      res.status(200).json({
        message: "Ideia atualizada com sucesso",
      });
    } catch (err) {
      console.error("Erro ao atualizar ideia:", err);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },

  async deleteIdeia(req, res) {
    const ideiaId = req.params.id;
    const authenticatedUserId = req.user?.id;

    try {
      if (!authenticatedUserId) {
        return res.status(401).json({
          error: "Você precisa estar logado para deletar uma ideia",
        });
      }

      const ideia = await Ideia.findByPk(ideiaId);
      if (!ideia) {
        return res.status(404).json({
          error: "Ideia não encontrada",
        });
      }

      if (ideia.user_id !== authenticatedUserId) {
        return res.status(403).json({
          error: "Você só pode deletar suas próprias ideias",
        });
      }

      await Ideia.destroy({ where: { id: ideiaId } });

      res.status(200).json({
        message: "Ideia deletada com sucesso",
      });
    } catch (err) {
      console.error("Erro ao deletar ideia:", err);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },

  async getIdeias(req, res) {
    const { category, page = 1, limit = 10 } = req.query;
    let title = req.query.title || req.query.search || "";
    title = title.trim();

    try {
      let whereCondition = {};
      if (category && category !== "all") {
        whereCondition.category_id = parseInt(category, 10);
      }
      if (title.length > 0) {
        whereCondition.title = {
          [Op.iLike]: `%${title}%`,
        };
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { count, rows: ideias } = await Ideia.findAndCountAll({
        where: whereCondition,
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["id", "name"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
          {
            model: Vote,
            as: "votes",
            attributes: ["vote_value"],
          },
        ],
        order: [["created_at", "DESC"]],
        limit: parseInt(limit),
        offset,
      });

      const ideiasWithStats = ideias.map((ideia) => {
        const votes = ideia.votes || [];
        const upvotes = votes.filter((vote) => vote.vote_value === 1).length;
        const downvotes = votes.filter((vote) => vote.vote_value === 0).length;

        return {
          ...ideia.toJSON(),
          upvotes,
          downvotes,
          totalVotes: votes.length,
        };
      });

      res.status(200).json({
        ideias: ideiasWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / parseInt(limit)),
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      });
    } catch (err) {
      console.error("Erro ao buscar ideias:", err);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },

  async voteIdeia(req, res) {
    const ideiaId = req.params.id;
    const { vote_value } = req.body;
    const authenticatedUserId = req.user?.id;

    try {
      if (!authenticatedUserId) {
        return res.status(401).json({
          error: "Você precisa estar logado para votar",
        });
      }

      if (vote_value !== 0 && vote_value !== 1) {
        return res.status(400).json({
          error: "Valor do voto deve ser 0 (downvote) ou 1 (upvote)",
        });
      }

      const ideia = await Ideia.findByPk(ideiaId);
      if (!ideia) {
        return res.status(404).json({
          error: "Ideia não encontrada",
        });
      }

      if (ideia.user_id === authenticatedUserId) {
        return res.status(403).json({
          error: "Você não pode votar na sua própria ideia",
        });
      }

      const [vote, created] = await Vote.upsert(
        {
          user_id: authenticatedUserId,
          idea_id: parseInt(ideiaId),
          vote_value,
        },
        {
          returning: true,
        }
      );

      const message = created
        ? "Voto registrado com sucesso"
        : "Voto atualizado com sucesso";

      res.status(200).json({
        message,
        vote,
      });
    } catch (err) {
      console.error("Erro ao votar:", err);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },

  async removeVote(req, res) {
    const ideiaId = req.params.id;
    const authenticatedUserId = req.user?.id;

    try {
      if (!authenticatedUserId) {
        return res.status(401).json({
          error: "Você precisa estar logado para remover voto",
        });
      }

      const vote = await Vote.findOne({
        where: {
          user_id: authenticatedUserId,
          idea_id: parseInt(ideiaId),
        },
      });

      if (!vote) {
        return res.status(404).json({
          error: "Voto não encontrado",
        });
      }

      await vote.destroy();

      res.status(200).json({
        message: "Voto removido com sucesso",
      });
    } catch (err) {
      console.error("Erro ao remover voto:", err);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },

  async getIdeia(req, res) {
    const ideiaId = req.params.id;

    try {
      const ideia = await Ideia.findByPk(ideiaId, {
        include: [
          {
            model: Category,
            as: "category",
            attributes: ["id", "name"],
          },
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
          {
            model: Vote,
            as: "votes",
            attributes: ["vote_value", "user_id"],
          },
        ],
      });

      if (!ideia) {
        return res.status(404).json({
          error: "Ideia não encontrada",
        });
      }

      const votes = ideia.votes || [];
      const upvotes = votes.filter((vote) => vote.vote_value === 1).length;
      const downvotes = votes.filter((vote) => vote.vote_value === 0).length;

      const ideiaWithStats = {
        ...ideia.toJSON(),
        upvotes,
        downvotes,
        totalVotes: votes.length,
      };

      res.status(200).json({
        ideia: ideiaWithStats,
      });
    } catch (err) {
      console.error("Erro ao buscar ideia:", err);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },
};
