const express = require("express");
const router = express.Router();

router.post("/ideas/:id/vote", async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/(^|; )userId=([^;]+)/);
    const userId =
      (req.cookies && req.cookies.userId) || (match ? match[2] : null);

    if (!userId) {
      req.flash("error", "Você precisa estar logado para votar.");
      return res.redirect("/pages/login");
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
      req.flash("error", err.error || "Erro ao votar");
      return res.redirect("/pages/ideas");
    }

    req.flash(
      "success",
      vote_value === 1 ? "Voto a favor registrado!" : "Voto contra registrado!"
    );
    res.redirect("/pages/ideas");
  } catch (error) {
    req.flash("error", "Erro ao processar seu voto");
    res.redirect("/pages/ideas");
  }
});

router.get("/ideas", async (req, res) => {
  try {
    const searchTerm =
      req.query.search?.trim() || req.query.title?.trim() || "";
    const selectedCategory = req.query.category;
    let url = `http://localhost:${process.env.PORT || 3000}/api/ideas`;
    
    if (searchTerm) {
      url += `?title=${encodeURIComponent(searchTerm)}`;
    }
    if (selectedCategory) {
      url += `${searchTerm ? '&' : '?'}category=${encodeURIComponent(selectedCategory)}`;
    }

    // Buscar ideias e categorias em paralelo
    const [ideasResponse, categoriesResponse] = await Promise.all([
      fetch(url),
      fetch(`http://localhost:${process.env.PORT || 3000}/api/categories`)
    ]);

    const [data, categoriesData] = await Promise.all([
      ideasResponse.json(),
      categoriesResponse.json()
    ]);

    const ideas = (data.ideias || []).map((ideia) => ({
      ...ideia,
      authorName: ideia.user?.name || "Desconhecido",
      votesCount: ideia.totalVotes ?? 0,
      upvotes: ideia.upvotes ?? 0,
      downvotes: ideia.downvotes ?? 0,
      category: ideia.category || { name: "Sem categoria" },
    }));

    res.render("index", {
      ideas,
      searchTerm,
      categories: categoriesData.categories,
      selectedCategory,
      layout: "main",
    });
  } catch (error) {
    res.render("index", {
      error: "Erro ao carregar ideias",
      categories: [],
      layout: "main",
    });
  }
});

router.get("/ideas/new", async (req, res) => {
  try {
    // Busca todas as categorias
    const response = await fetch(
      `http://localhost:${process.env.PORT || 3000}/api/categories`
    );
    const data = await response.json();

    res.render("idea_new", {
      categories: data.categories,
      csrfToken: req.csrfToken(),
      layout: "main",
    });
  } catch (error) {
    res.render("idea_new", {
      error: "Erro ao carregar categorias",
      csrfToken: req.csrfToken(),
      layout: "main",
    });
  }
});

// POST /ideas/create - Cria nova ideia
router.post("/ideas/create", async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/(^|; )userId=([^;]+)/);
    const userId =
      (req.cookies && req.cookies.userId) || (match ? match[2] : null);

    if (!userId) {
      req.flash("error", "Você precisa estar logado para criar uma ideia.");
      return res.redirect("/pages/login");
    }

    const body = {
      title: req.body.title,
      description: req.body.description,
      category_id: req.body.category_id,
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
      req.flash("error", err.error || "Erro ao criar ideia");

      const categoriesResponse = await fetch(
        `http://localhost:${process.env.PORT || 3000}/api/categories`
      );
      const categoriesData = await categoriesResponse.json();

      return res.render("idea_new", {
        categories: categoriesData.categories,
        idea: body,
        layout: "main",
      });
    }

    req.flash("success", "Ideia criada com sucesso!");
    res.redirect("/pages/ideas");
  } catch (error) {
    req.flash("error", "Erro ao criar ideia");
    res.redirect("/pages/ideas/new");
  }
});

router.post("/ideas/:id", async (req, res) => {
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

    // Se for PUT (edição)
    if (
      req.query &&
      req.query._method &&
      req.query._method.toUpperCase() === "PUT"
    ) {
      const body = {
        title: req.body.title,
        description: req.body.description,
        category_id: req.body.category_id,
      };

      const response = await fetch(
        `http://localhost:${process.env.PORT || 3000}/api/ideas/${
          req.params.id
        }`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-user-id": String(userId),
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        return res.render("idea_edit", {
          idea: { ...body, id: req.params.id },
          error: err.error || "Erro ao atualizar ideia",
          layout: "main",
        });
      }

      return res.redirect("/pages/ideas");
    }

    // Se for DELETE
    if (
      req.query &&
      req.query._method &&
      req.query._method.toUpperCase() === "DELETE"
    ) {
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

    // Se não for PUT nem DELETE
    res.redirect(`/pages/ideas/${req.params.id}`);
  } catch (error) {
    if (req.query._method === "PUT") {
      return res.render("idea_edit", {
        idea: { ...req.body, id: req.params.id },
        error: "Erro ao atualizar ideia",
        layout: "main",
      });
    }
    res.redirect(
      "/pages/ideas?error=" + encodeURIComponent("Erro ao processar operação")
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
      categoryName: ideia.category?.name || "Sem categoria",
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

    // Busca ideia e categorias em paralelo
    const [ideaResponse, categoriesResponse] = await Promise.all([
      fetch(
        `http://localhost:${process.env.PORT || 3000}/api/ideas/${
          req.params.id
        }`,
        {
          headers: {
            "x-user-id": String(userId),
          },
        }
      ),
      fetch(`http://localhost:${process.env.PORT || 3000}/api/categories`),
    ]);

    if (!ideaResponse.ok) {
      return res.render("error", {
        error: "Ideia não encontrada",
        layout: "main",
      });
    }

    const ideaData = await ideaResponse.json();
    const categoriesData = await categoriesResponse.json();

    res.render("idea_edit", {
      idea: ideaData.ideia || ideaData.idea,
      categories: categoriesData.categories,
      csrfToken: req.csrfToken(),
      layout: "main",
    });
  } catch (error) {
    res.render("error", {
      error: "Erro ao carregar ideia",
      layout: "main",
    });
  }
});

// Renderiza o formulário de login
router.get("/login", (req, res) => {
  res.render("auth_login", { csrfToken: req.csrfToken() });
});

// Processa o formulário de login
router.post("/login", async (req, res) => {
  try {
    console.log("Login request body:", req.body);
    console.log("Attempting to login with:", {
      ...req.body,
      password: "[HIDDEN]",
    });
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

    const data = await response.json().catch(() => ({}));
    console.log("Login response:", data);

    if (!response.ok || !data.user || !data.user.id) {
      req.flash("error", data.error || "Email ou senha inválidos");
      return res.redirect("/pages/login");
    }

    // Configurar cookie com userId
    res.cookie("userId", String(data.user.id), {
      httpOnly: false,
      maxAge: 3600000, // 1 hora
      path: "/",
    });

    req.flash("success", "Login realizado com sucesso!");
    res.redirect("/pages/ideas");
  } catch (error) {
    console.error("Erro no fluxo de login (view):", error);
    req.flash("error", "Erro ao processar login. Tente novamente.");
    res.redirect("/pages/login");
  }
});

// Renderiza o formulário de registro
router.get("/register", (req, res) => {
  res.render("auth_register", { csrfToken: req.csrfToken() });
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
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      req.flash("error", data.error || "Erro ao criar conta. Tente novamente.");
      return res.redirect("/pages/register");
    }

    req.flash(
      "success",
      "Conta criada com sucesso! Faça login para continuar."
    );
    res.redirect("/pages/login"); // Sucesso - redireciona para login
  } catch (error) {
    console.error("Erro no fluxo de registro (view):", error);
    req.flash("error", "Erro ao criar conta. Tente novamente.");
    res.redirect("/pages/register");
  }
});

// Rota para mostrar o perfil do usuário
router.get("/profile", async (req, res) => {
  try {
    const cookieHeader = req.headers.cookie || "";
    const match = cookieHeader.match(/(^|; )userId=([^;]+)/);
    const userId =
      (req.cookies && req.cookies.userId) || (match ? match[2] : null);

    if (!userId) {
      return res.render("auth_login", {
        error: "Você precisa estar logado para ver seu perfil.",
        layout: "main",
      });
    }

    // Buscar informações do usuário e suas ideias em paralelo
    const [userResponse, ideasResponse] = await Promise.all([
      fetch(
        `http://localhost:${process.env.PORT || 3000}/api/users/${userId}`,
        {
          headers: {
            "x-user-id": String(userId),
          },
        }
      ),
      fetch(
        `http://localhost:${
          process.env.PORT || 3000
        }/api/ideas?userId=${userId}`,
        {
          headers: {
            "x-user-id": String(userId),
          },
        }
      ),
    ]);

    if (!userResponse.ok) {
      return res.render("error", {
        error: "Erro ao carregar informações do usuário",
        layout: "main",
      });
    }

    const userData = await userResponse.json();
    const ideasData = await ideasResponse.json();

    // Processar as ideias para incluir informações de categoria e votos
    const userIdeas = (ideasData.ideias || []).map((ideia) => ({
      ...ideia,
      votesCount: ideia.totalVotes ?? 0,
      upvotes: ideia.upvotes ?? 0,
      downvotes: ideia.downvotes ?? 0,
      category: ideia.category || { name: "Sem categoria" },
    }));

    res.render("profile", {
      user: userData.user,
      ideas: userIdeas,
      layout: "main",
    });
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    res.render("error", {
      error: "Erro ao carregar perfil",
      layout: "main",
    });
  }
});

module.exports = router;
