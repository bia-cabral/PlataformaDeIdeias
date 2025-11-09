const { DataTypes } = require("sequelize");
const db = require("../../db/conn");

const Ideia = db.define("Ideia", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING(254),
    allowNull: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'category',
      key: 'id'
    }
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'idea',
  timestamps: false
});

Ideia.associate = (models) => {
  Ideia.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  Ideia.belongsTo(models.Category, {
    foreignKey: 'category_id',
    as: 'category'
  });

  Ideia.hasMany(models.Vote, {
    foreignKey: 'idea_id',
    as: 'votes'
  });

  Ideia.belongsToMany(models.User, {
    through: models.Vote,
    foreignKey: 'idea_id',
    otherKey: 'user_id',
    as: 'voters'
  });
};

module.exports = Ideia;