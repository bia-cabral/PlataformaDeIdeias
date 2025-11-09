const User = require('./User');
const Category = require('./Category');
const Ideia = require('./Ideia');
const Vote = require('./Vote');

const models = {
  User,
  Category,
  Ideia,
  Vote
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

module.exports = models;