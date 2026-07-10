/**
 * FILE: models/User.js
 *
 * PURPOSE:
 * Sequelize model for registered users and their financial profile.
 *
 * REPRESENTS:
 * A person using FlexiBudget to plan irregular income spending.
 *
 * RELATIONSHIPS:
 * - hasMany: expenses, incomes, goals, subscriptions, investments (CASCADE delete)
 *
 * CONSTRAINTS:
 * - email: unique, indexed (login lookup)
 * - password_hash: required, never exposed via API
 *
 * See docs/DATABASE.md for full schema reference.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    current_balance: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },
    archetype: {
      type: DataTypes.STRING(32),
      allowNull: true,
    },
    onboarding_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    token_version: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: 'users',
    indexes: [{ unique: true, fields: ['email'] }],
  }
);

module.exports = User;
