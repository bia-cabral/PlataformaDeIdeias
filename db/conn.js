const { Sequelize } = require("sequelize");

const DB_NAME = process.env.DB_NAME || "tasks_db";
const DB_USER = process.env.DB_USER || "root";
const DB_PASS = process.env.DB_PASS || "root";
const DB_HOST = process.env.DB_HOST || "localhost";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: "mysql"
});

try {
  sequelize.authenticate();
  console.log("🔌 Conexão com o MySQL estabelecida com sucesso!");
} catch (error) {
  console.error("❌ Não foi possível conectar ao banco de dados:", error);
}

module.exports = sequelize;
