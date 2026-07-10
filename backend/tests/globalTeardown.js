module.exports = async () => {
  try {
    const { sequelize } = require('../models');
    await sequelize.close();
  } catch {
    /* ignore */
  }
};
