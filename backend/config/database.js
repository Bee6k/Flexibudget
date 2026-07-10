const { Sequelize } = require('sequelize');

const dialectOptions = {};
if (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
  };
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: { underscored: false, timestamps: true },
    dialectOptions,
  }
);

module.exports = sequelize;
