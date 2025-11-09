const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const path = require("path");
// const flash = require('connect-flash');
// const csrf = require('csurf');

const express = require("express");
const cors = require("cors");

const ideaRoutes = require("../routes/ideaRoutes");
const userRoutes = require("../routes/userRoutes");
const categoryRoutes = require("../routes/categoryRoutes");
const viewRoutes = require("../routes/viewRoutes");
const userMiddleware = require("./middleware/userMiddleware");

require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/pages", userMiddleware);
app.use("/pages", viewRoutes);

// Rotas de API
app.use("/api/ideas", ideaRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);

// Rota raiz - redireciona para página de login
app.get("/", (req, res) => {
  res.redirect("/pages/login");
});

app.engine(
  "hbs",
  exphbs.create({
    extname: ".hbs",
    layoutsDir: path.join(__dirname, "../../views/layouts"),
    partialsDir: path.join(__dirname, "../../views/partials"),
    helpers: {
      truncate: (str, len = 200) =>
        str && str.length > len ? str.slice(0, len) + "..." : str,
      eq: (v1, v2) => v1 === v2
    },
  }).engine
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../../views"));

app.use(express.static(path.join(__dirname, "../../public")));
app.use(methodOverride("_method"));
// app.use(flash());
// app.use(csrf());

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  // res.locals.success = req.flash('success');
  // res.locals.error = req.flash('error');
  res.locals.year = new Date().getFullYear();
  // res.locals.csrfToken = req.csrfToken();
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 API rodando em http://localhost:${PORT}`);
  console.log(`� Documentação: http://localhost:${PORT}/`);
  console.log(`💡 Ideias: http://localhost:${PORT}/api/ideas`);
  console.log(`👥 Usuários: http://localhost:${PORT}/api/users`);
  console.log(`📂 Categorias: http://localhost:${PORT}/api/categories`);
});
