const { sequelize } = require('../models');

module.exports = async () => {
  try {
    await sequelize.close();
  } catch {
    /* already closed */
  }
};
