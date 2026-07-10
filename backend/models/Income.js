const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Income = sequelize.define(
  'Income',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    source_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01 },
    },
    expected_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    is_recurring: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'incomes',
    indexes: [{ fields: ['user_id'] }, { fields: ['user_id', 'expected_date'] }],
  }
);

module.exports = Income;
