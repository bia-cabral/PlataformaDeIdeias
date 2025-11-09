const { DataTypes } = require("sequelize");
const db = require("../../db/conn");

const Category = db.define("Category", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(254),
    allowNull: false,
    unique: true,
  }
}, {
  tableName: 'category',
  timestamps: false
});

Category.associate = (models) => {
  Category.hasMany(models.Ideia, {
    foreignKey: 'category_id',
    as: 'ideas'
  });
};

module.exports = Category;