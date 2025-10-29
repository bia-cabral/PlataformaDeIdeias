const express = require("express");
const exphbs = require("express-handlebars");
const conn = require("../../db/conn");
const ideaRoutes = require("../../routes/ideaRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express.static("public"));

app.use("/ideas", ideaRoutes);
app.get("/", (_, res) => res.redirect("/home"));

conn
  .sync()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Servidor rodando com sucesso em http://localhost:${PORT}`)
    );
  })
  .catch((err) =>
    console.log("❌ Erro ao conectar com o banco de dados:", err)
);