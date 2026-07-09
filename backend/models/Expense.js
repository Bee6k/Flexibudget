/**
 * FILE: models/Expense.js
 *
 * PURPOSE:
 * User spending line items assigned to priority tiers for waterfall allocation.
 *
 * BUSINESS RULES:
 * - priority_tier 1–4 maps to Essentials → Lifestyle
 * - frequency drives monthly burn via utils/finance.toMonthly
 * - is_active=false is soft delete (excluded from queries)
 *
 * RELATIONSHIPS:
 * - belongsTo User (user_id FK, CASCADE)
 *
 * See docs/DATABASE.md
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define(
  'Expense',
  {
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
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { min: 0.01 },
    },
    frequency: {
      type: DataTypes.ENUM('weekly', 'monthly', 'yearly', 'one-time'),
      allowNull: false,
    },
    priority_tier: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 4 },
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    tableName: 'expenses',
    indexes: [{ fields: ['user_id'] }, { fields: ['user_id', 'priority_tier'] }],
  }
);

module.exports = Expense;
