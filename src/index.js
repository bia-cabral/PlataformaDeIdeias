const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const session = require("express-session");
const flash = require("connect-flash");
const csurf = require("csurf");
const cookieParser = require("cookie-parser");

const ideaRoutes = require("../routes/ideaRoutes");
const userRoutes = require("../routes/userRoutes");
const categoryRoutes = require("../routes/categoryRoutes");
const viewRoutes = require("../routes/viewRoutes");
const userMiddleware = require("./middleware/userMiddleware");

require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares básicos
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Configuração da sessão
app.use(
  session({
    secret: "plataforma-de-ideias-secret",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      secure: false,
    },
  })
);

// Configuração do Flash
app.use(flash());

app.use(express.static(path.join(__dirname, "../public")));
app.use(methodOverride("_method"));

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.info = req.flash("info");
  res.locals.year = new Date().getFullYear();
  next();
});

// Mount API routes before enabling CSRF for page routes. API calls are internal
// server-to-server fetches from the pages code and should not be blocked by CSRF.
app.use("/api/ideas", ideaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);

// Enable CSRF protection only for the page routes (views). This ensures forms
// rendered to the browser get a token, while internal API requests aren't
// rejected due to missing CSRF tokens.
app.use("/pages", csurf({ cookie: true }));

// After CSRF middleware for pages, expose the token to views and handle
// CSRF errors for those routes.
app.use("/pages", (req, res, next) => {
  try {
    res.locals.csrfToken = req.csrfToken();
  } catch (err) {
    res.locals.csrfToken = null;
  }

  next();
});

// Handler de erro CSRF (aplica-se às rotas que usam csurf, i.e. /pages)
app.use((err, req, res, next) => {
  if (err.code !== "EBADCSRFTOKEN") return next(err);

  // Handle CSRF token errors here
  req.flash(
    "error",
    "Formulário expirado ou inválido. Por favor, tente novamente."
  );

  // Redireciona para a página inicial se não houver referer
  const referer = req.get("referer");
  if (!referer) {
    return res.redirect("/");
  }

  // Extrai o caminho do referer
  const refererPath = new URL(referer).pathname;
  res.redirect(refererPath || "/");
});

app.use("/pages", userMiddleware);
app.use("/pages", viewRoutes);

app.get("/", (req, res) => {
  res.render("welcome", {
    layout: "main",
    title: "Bem-vindo | Plataforma de Ideias",
  });
});

app.engine(
  "hbs",
  exphbs.create({
    extname: ".hbs",
    layoutsDir: path.join(__dirname, "../views/layouts"),
    partialsDir: path.join(__dirname, "../views/partials"),
    helpers: {
      truncate: (str, len = 200) =>
        str && str.length > len ? str.slice(0, len) + "..." : str,
      eq: (v1, v2) => String(v1) === String(v2),
      string: (value) => String(value),
    },
  }).engine
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../views"));

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
  console.log(`📄 Documentação: http://localhost:${PORT}/`);
  console.log(`💡 Ideias: http://localhost:${PORT}/api/ideas`);
  console.log(`👥 Usuários: http://localhost:${PORT}/api/users`);
  console.log(`📂 Categorias: http://localhost:${PORT}/api/categories`);
});
