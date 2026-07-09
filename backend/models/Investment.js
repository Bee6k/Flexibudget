const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Investment = sequelize.define('Investment', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  asset_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Other',
  },
  value: {
    type: DataTypes.DECIMAL(14, 2),
    allowNull: false,
    validate: { min: 0.01 },
  },
  change_pct: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: false,
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'investments',
  indexes: [{ fields: ['user_id'] }],
});

module.exports = Investment;
