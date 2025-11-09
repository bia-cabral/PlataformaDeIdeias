const { Category, Ideia } = require("../models");

module.exports = {
  async getCategories(req, res) {
    try {
      const categories = await Category.findAll({
        include: [
          {
            model: Ideia,
            as: 'ideas',
            attributes: ['id']
          }
        ],
        order: [['name', 'ASC']]
      });

      const categoriesWithCount = categories.map(category => ({
        ...category.toJSON(),
        ideasCount: category.ideas ? category.ideas.length : 0
      }));

      res.status(200).json({
        categories: categoriesWithCount
      });
    } catch (err) {
      console.error("Erro ao buscar categorias:", err);
      res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  },

  async saveCategory(req, res) {
    const { name } = req.body;
    const authenticatedUserId = req.user?.id;
    
    try {
      if (!authenticatedUserId) {
        return res.status(401).json({
          error: "Você precisa estar logado para criar uma categoria"
        });
      }

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          error: "Nome da categoria é obrigatório"
        });
      }

      if (name.length > 254) {
        return res.status(400).json({
          error: "Nome da categoria deve ter no máximo 254 caracteres"
        });
      }

      const category = await Category.create({ 
        name: name.trim() 
      });
      
      res.status(201).json({
        message: "Categoria criada com sucesso",
        category
      });
    } catch (err) {
      console.error("Erro ao criar categoria:", err);
      
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: "Esta categoria já existe"
        });
      }
      
      res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  },

  async getCategory(req, res) {
    const categoryId = req.params.id;
    
    try {
      const category = await Category.findByPk(categoryId, {
        include: [
          {
            model: Ideia,
            as: 'ideas',
            attributes: ['id', 'title', 'description', 'created_at'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['id', 'name']
              }
            ]
          }
        ]
      });

      if (!category) {
        return res.status(404).json({
          error: "Categoria não encontrada"
        });
      }

      res.status(200).json({
        category
      });
    } catch (err) {
      console.error("Erro ao buscar categoria:", err);
      res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  },

  async updateCategory(req, res) {
    const { name } = req.body;
    const categoryId = req.params.id;
    const authenticatedUserId = req.user?.id;
    
    try {
      if (!authenticatedUserId) {
        return res.status(401).json({
          error: "Você precisa estar logado para editar uma categoria"
        });
      }

      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({
          error: "Categoria não encontrada"
        });
      }

      if (!name || name.trim().length === 0) {
        return res.status(400).json({
          error: "Nome da categoria é obrigatório"
        });
      }

      if (name.length > 254) {
        return res.status(400).json({
          error: "Nome da categoria deve ter no máximo 254 caracteres"
        });
      }

      await Category.update(
        { name: name.trim() },
        { where: { id: categoryId } }
      );
      
      res.status(200).json({
        message: "Categoria atualizada com sucesso"
      });
    } catch (err) {
      console.error("Erro ao atualizar categoria:", err);
      
      if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
          error: "Esta categoria já existe"
        });
      }
      
      res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  },

  async deleteCategory(req, res) {
    const categoryId = req.params.id;
    const authenticatedUserId = req.user?.id;
    
    try {
      if (!authenticatedUserId) {
        return res.status(401).json({
          error: "Você precisa estar logado para deletar uma categoria"
        });
      }

      const category = await Category.findByPk(categoryId, {
        include: [
          {
            model: Ideia,
            as: 'ideas'
          }
        ]
      });

      if (!category) {
        return res.status(404).json({
          error: "Categoria não encontrada"
        });
      }

      if (category.ideas && category.ideas.length > 0) {
        return res.status(400).json({
          error: "Não é possível excluir esta categoria pois há ideias vinculadas a ela",
          ideasCount: category.ideas.length
        });
      }

      await Category.destroy({ where: { id: categoryId } });
      
      res.status(200).json({
        message: "Categoria deletada com sucesso"
      });
    } catch (err) {
      console.error("Erro ao deletar categoria:", err);
      res.status(500).json({
        error: "Erro interno do servidor"
      });
    }
  }
};