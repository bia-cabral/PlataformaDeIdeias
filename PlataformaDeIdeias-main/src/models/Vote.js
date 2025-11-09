const { DataTypes } = require("sequelize");
const db = require("../../db/conn");

const Vote = db.define("Vote", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  idea_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'idea',
      key: 'id'
    }
  },
  vote_value: {
    type: DataTypes.SMALLINT,
    allowNull: false,
    validate: {
      isIn: [[0, 1]]
    }
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'vote',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'idea_id'],
      name: 'uniq_user_idea_vote'
    }
  ]
});

Vote.associate = (models) => {
  Vote.belongsTo(models.User, {
    foreignKey: 'user_id',
    as: 'user'
  });

  Vote.belongsTo(models.Ideia, {
    foreignKey: 'idea_id',
    as: 'idea'
  });
};

module.exports = Vote;