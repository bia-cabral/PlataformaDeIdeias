const express = require("express");
const router = express.Router();

router.post("/ideas/:id/vote", async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/(^|; )userId=([^;]+)/);
    const userId =
      (req.cookies && req.cookies.userId) || (match ? match[2] : null);

    if (!userId) {
      return res.render("auth_login", {
        error: "Você precisa estar logado.",
        layout: "main",
      });
    }

    let vote_value =
      req.body.vote_value !== undefined ? req.body.vote_value : 1;
    vote_value = parseInt(vote_value, 10);

    const response = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/ideas/${
        req.params.id
      }/vote`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": String(userId),
        },
        body: JSON.stringify({ vote_value }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.redirect(
        "/pages/ideas?error=" + encodeURIComponent(err.error || "Erro ao votar")
      );
    }

    res.redirect("/pages/ideas");
  } catch (error) {
    res.redirect("/pages/ideas?error=" + encodeURIComponent("Erro ao votar"));
  }
});

router.get("/ideas", async (req, res) => {
  try {
    const response = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/ideas`
    );
    const data = await response.json();
    const ideas = (data.ideias || []).map((ideia) => ({
      ...ideia,
      authorName: ideia.user?.name || "Desconhecido",
      votesCount: ideia.totalVotes ?? 0,
      upvotes: ideia.upvotes ?? 0,
      downvotes: ideia.downvotes ?? 0,
    }));
    res.render("index", {
      ideas,
      layout: "main",
    });
  } catch (error) {
    res.render("index", {
      error: "Erro ao carregar ideias",
      layout: "main",
    });
  }
});

router.get("/ideas/new", (req, res) => {
  res.render("idea_new", { layout: "main" });
});

// Processa formulário de criação de ideia (via views) e encaminha para a API
router.post("/ideas/create", async (req, res) => {
  try {
    // Extrai userId do cookie (tanto via req.cookies se disponível quanto do header bruto)
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/(^|; )userId=([^;]+)/);
    const userId =
      (req.cookies && req.cookies.userId) || (match ? match[2] : null);

    if (!userId) {
      // não autenticado
      return res.render("auth_login", {
        error: "Você precisa estar logado.",
        layout: "main",
      });
    }

    const body = {
      title: req.body.title,
      description: req.body.description,
      category_id: req.body.category || null,
    };

    const response = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/ideas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": String(userId),
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.render("idea_new", {
        error: err.error || "Erro ao criar ideia",
        layout: "main",
      });
    }

    // sucesso
    res.redirect("/pages/ideas");
  } catch (error) {
    res.render("idea_new", { error: "Erro ao criar ideia", layout: "main" });
  }
});

router.post("/ideas/:id", async (req, res) => {
  try {
    if (
      req.query &&
      req.query._method &&
      req.query._method.toUpperCase() === "DELETE"
    ) {
      const cookieHeader = req.headers.cookie || "";
      const match = cookieHeader.match(/(^|; )userId=([^;]+)/);
      const userId =
        (req.cookies && req.cookies.userId) || (match ? match[2] : null);

      if (!userId) {
        return res.render("auth_login", {
          error: "Você precisa estar logado.",
          layout: "main",
        });
      }

      const response = await fetch(
        `http://localhost:${process.env.PORT || 3000}/api/ideas/${
          req.params.id
        }`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": String(userId),
          },
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.redirect(
          "/pages/ideas?error=" +
            encodeURIComponent(err.error || "Erro ao excluir ideia")
        );
      }

      return res.redirect("/pages/ideas");
    }

    res.redirect(`/pages/ideas/${req.params.id}`);
  } catch (error) {
    res.redirect(
      "/pages/ideas?error=" + encodeURIComponent("Erro ao excluir ideia")
    );
  }
});

router.get("/ideas/:id", async (req, res) => {
  try {
    const response = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/ideas/${req.params.id}`
    );
    const data = await response.json();

    const ideia = data.ideia || data.idea || null;
    if (!ideia) {
      return res.render("error", {
        error: "Ideia não encontrada",
        layout: "main",
      });
    }

    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/(^|; )userId=([^;]+)/);
    const userId =
      (req.cookies && req.cookies.userId) || (match ? match[2] : null);

    const ideaForView = {
      ...ideia,
      authorName: ideia.user?.name || "Desconhecido",
      votesCount: ideia.totalVotes ?? 0,
      upvotes: ideia.upvotes ?? 0,
      downvotes: ideia.downvotes ?? 0,
    };

    let voted = false;
    if (userId && Array.isArray(ideia.votes)) {
      voted = ideia.votes.some((v) => {
        const voterId = v.user_id ?? (v.user && v.user.id) ?? v.userId;
        return String(voterId) === String(userId);
      });
    }

    const canEdit = Boolean(
      userId && String(ideia.user?.id) === String(userId)
    );
    // Garante que o autor não seja marcado como "voted" (autor não vota na própria ideia)
    if (canEdit) voted = false;

    res.render("idea_show", {
      idea: ideaForView,
      votesCount: ideaForView.votesCount,
      user: userId ? { id: userId } : null,
      voted,
      canEdit,
      layout: "main",
    });
  } catch (error) {
    res.render("error", {
      error: "Ideia não encontrada",
      layout: "main",
    });
  }
});

router.get("/ideas/:id/edit", async (req, res) => {
  try {
    const response = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/ideas/${req.params.id}`
    );
    const data = await response.json();
    res.render("idea_edit", {
      idea: data.idea,
      layout: "main",
    });
  } catch (error) {
    res.render("error", {
      error: "Ideia não encontrada",
      layout: "main",
    });
  }
});

// Renderiza o formulário de login
router.get("/login", (req, res) => {
  res.render("auth_login");
});

// Processa o formulário de login
router.post("/login", async (req, res) => {
  try {
    const response = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/users/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    if (!response.ok) {
      throw new Error("Login falhou");
    }

    const data = await response.json();

    res.cookie("userId", data.user.id, {
      httpOnly: false,
      maxAge: 3600000,
    });

    res.redirect("/pages/ideas"); // Sucesso - redireciona para lista de ideias
  } catch (error) {
    res.render("auth_login", {
      error: "Email ou senha inválidos",
      layout: "main",
    });
  }
});

// Renderiza o formulário de registro
router.get("/register", (req, res) => {
  res.render("auth_register");
});

// Processa o formulário de registro
router.post("/register", async (req, res) => {
  try {
    const response = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/users/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body),
      }
    );

    if (!response.ok) {
      throw new Error("Registro falhou");
    }

    const data = await response.json();
    res.redirect("/pages/login"); // Sucesso - redireciona para login
  } catch (error) {
    res.render("auth_register", {
      error: "Erro ao criar conta. Tente novamente.",
      layout: "main",
    });
  }
});

module.exports = router;
