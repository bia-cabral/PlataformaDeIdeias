const { User } = require("../models");
const bcrypt = require("bcrypt");

module.exports = {
  async saveUser(req, res) {
    const { name, email, password } = req.body;

    try {
      if (!name || !email || !password) {
        return res.status(400).json({
          error: "Nome, email e senha são obrigatórios",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          error: "A senha deve ter pelo menos 6 caracteres",
        });
      }

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      const { password: _, ...userWithoutPassword } = user.toJSON();

      res.status(201).json({
        message: "Usuário criado com sucesso",
        user: userWithoutPassword,
      });
    } catch (err) {
      console.error("Erro ao criar usuário:", err);

      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          error: "Este email já está em uso",
        });
      }

      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },

  async updateUser(req, res) {
    const { name, email, currentPassword, newPassword } = req.body;
    const userId = req.params.id;
    const authenticatedUserId = req.user?.id;

    try {
      if (parseInt(userId) !== authenticatedUserId) {
        return res.status(403).json({
          error: "Você só pode editar seu próprio perfil",
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado",
        });
      }

      if (!name || !email) {
        return res.status(400).json({
          error: "Nome e email são obrigatórios",
        });
      }

      const updateData = { name, email };

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            error: "Senha atual é obrigatória para alterar a senha",
          });
        }

        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password
        );
        if (!isCurrentPasswordValid) {
          return res.status(400).json({
            error: "Senha atual incorreta",
          });
        }

        if (newPassword.length < 6) {
          return res.status(400).json({
            error: "A nova senha deve ter pelo menos 6 caracteres",
          });
        }

        const saltRounds = 10;
        updateData.password = await bcrypt.hash(newPassword, saltRounds);
      }

      await User.update(updateData, { where: { id: userId } });

      res.status(200).json({
        message: "Usuário atualizado com sucesso",
      });
    } catch (err) {
      console.error("Erro ao atualizar usuário:", err);

      if (err.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          error: "Este email já está em uso",
        });
      }

      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },

  async deleteUser(req, res) {
    const userId = req.params.id;
    const authenticatedUserId = req.user?.id;
    const { password } = req.body;

    try {
      if (parseInt(userId) !== authenticatedUserId) {
        return res.status(403).json({
          error: "Você só pode deletar sua própria conta",
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado",
        });
      }

      if (!password) {
        return res.status(400).json({
          error: "Senha é obrigatória para excluir a conta",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          error: "Senha incorreta",
        });
      }

      await User.destroy({ where: { id: userId } });

      res.status(200).json({
        message: "Conta excluída com sucesso",
      });
    } catch (err) {
      console.error("Erro ao deletar usuário:", err);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },

  async loginUser(req, res) {
    const { email, password } = req.body;

    try {
      console.log("Login attempt for email:", email);

      // Validação dos campos
      if (!email || !password) {
        console.log("Missing email or password");
        return res.status(400).json({
          error: "Email e senha são obrigatórios",
        });
      }

      // Busca o usuário pelo email
      console.log("Searching for user in database...");
      const user = await User.findOne({
        where: { email },
        attributes: ["id", "name", "email", "password"],
      });

      console.log("Database query complete");
      console.log(
        "User found:",
        user
          ? { id: user.id, email: user.email, name: user.name }
          : "No user found"
      );

      // Verifica se o usuário existe
      if (!user) {
        console.log("User not found with email:", email);
        return res.status(401).json({
          error: "Credenciais inválidas",
        });
      }

      // Verifica a senha
      console.log("Comparing passwords...");
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log("Password validation result:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("Invalid password for user:", email);
        return res.status(401).json({
          error: "Credenciais inválidas",
        });
      }

      // Remove a senha antes de enviar a resposta
      const userObject = user.toJSON();
      delete userObject.password;

      // Retorna os dados do usuário
      res.status(200).json({
        message: "Login realizado com sucesso",
        user: userObject,
      });
    } catch (err) {
      console.error("Erro no login:", err);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },

  async getUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: ["id", "name", "email", "created_at"],
        order: [["created_at", "DESC"]],
      });

      res.status(200).json({
        users,
      });
    } catch (err) {
      console.error("Erro ao buscar usuários:", err);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },

  async getUserProfile(req, res) {
    const userId = req.params.id;
    const authenticatedUserId = req.user?.id;

    try {
      const attributes = ["id", "name", "email", "created_at"];

      if (parseInt(userId) === authenticatedUserId) {
      }

      const user = await User.findByPk(userId, { attributes });
      if (!user) {
        return res.status(404).json({
          error: "Usuário não encontrado",
        });
      }

      res.status(200).json({
        user,
      });
    } catch (err) {
      console.error("Erro ao buscar usuário:", err);
      res.status(500).json({
        error: "Erro interno do servidor",
      });
    }
  },
};
