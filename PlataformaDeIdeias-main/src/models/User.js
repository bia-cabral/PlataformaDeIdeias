const { DataTypes } = require("sequelize");
const db = require("../../db/conn");

const User = db.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(254),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(254),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(254),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'users',
  timestamps: false
});

User.associate = (models) => {
  User.hasMany(models.Ideia, {
    foreignKey: 'user_id',
    as: 'ideas'
  });

  User.hasMany(models.Vote, {
    foreignKey: 'user_id',
    as: 'votes'
  });

  User.belongsToMany(models.Ideia, {
    through: models.Vote,
    foreignKey: 'user_id',
    otherKey: 'idea_id',
    as: 'votedIdeas'
  });
};

module.exports = User;