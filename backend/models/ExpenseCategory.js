const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExpenseCategory = sequelize.define(
  'ExpenseCategory',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    default_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    frequency: {
      type: DataTypes.ENUM('weekly', 'monthly', 'yearly'),
      allowNull: true,
    },
    priority_tier: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    archetype: {
      type: DataTypes.ENUM('student', 'freelancer', 'family', 'businessman', 'worker', 'general'),
      allowNull: false,
    },
  },
  {
    tableName: 'expense_categories',
    indexes: [
      {
        unique: true,
        name: 'expense_categories_name_archetype_unique',
        fields: ['name', 'archetype'],
      },
    ],
  }
);

module.exports = ExpenseCategory;
