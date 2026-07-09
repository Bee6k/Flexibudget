/**
 * FILE: models/index.js
 *
 * PURPOSE:
 * Central Sequelize registry — associations, preset seed data, model exports.
 *
 * RESPONSIBILITIES:
 * - Define User → Expense/Income/Goal/Subscription/Investment associations (CASCADE delete)
 * - seedPresetCategories(): idempotent onboarding template seeding
 *
 * EXECUTED WHEN:
 * - Any file requires('../models')
 * - Server startup after sync (seedPresetCategories)
 *
 * MAINTAINER NOTES:
 * - Adding archetypes requires ENUM migration on expense_categories
 * - PRESET_CATEGORIES changes affect onboarding wizard defaults only (not existing users)
 */
const sequelize = require('../config/database');
const User = require('./User');
const Expense = require('./Expense');
const Income = require('./Income');
const ExpenseCategory = require('./ExpenseCategory');
const Goal = require('./Goal');
const Subscription = require('./Subscription');
const Investment = require('./Investment');

User.hasMany(Expense, { foreignKey: 'user_id', as: 'expenses', onDelete: 'CASCADE' });
Expense.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Income, { foreignKey: 'user_id', as: 'incomes', onDelete: 'CASCADE' });
Income.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Goal, { foreignKey: 'user_id', as: 'goals', onDelete: 'CASCADE' });
Goal.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Subscription, { foreignKey: 'user_id', as: 'subscriptions', onDelete: 'CASCADE' });
Subscription.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Investment, { foreignKey: 'user_id', as: 'investments', onDelete: 'CASCADE' });
Investment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

const PRESET_CATEGORIES = [
  { name: 'Rent', default_amount: 15000, frequency: 'monthly', priority_tier: 1, archetype: 'student' },
  { name: 'Groceries', default_amount: 2000, frequency: 'weekly', priority_tier: 1, archetype: 'student' },
  { name: 'Utilities', default_amount: 3000, frequency: 'monthly', priority_tier: 2, archetype: 'student' },
  { name: 'Internet', default_amount: 1500, frequency: 'monthly', priority_tier: 2, archetype: 'student' },
  { name: 'Textbooks', default_amount: 5000, frequency: 'yearly', priority_tier: 3, archetype: 'student' },
  { name: 'Transportation', default_amount: 2000, frequency: 'monthly', priority_tier: 2, archetype: 'student' },
  { name: 'Phone Bill', default_amount: 1000, frequency: 'monthly', priority_tier: 2, archetype: 'student' },
  { name: 'Entertainment', default_amount: 2000, frequency: 'monthly', priority_tier: 4, archetype: 'student' },
  { name: 'Rent', default_amount: 20000, frequency: 'monthly', priority_tier: 1, archetype: 'freelancer' },
  { name: 'Groceries', default_amount: 3000, frequency: 'weekly', priority_tier: 1, archetype: 'freelancer' },
  { name: 'Health Insurance', default_amount: 5000, frequency: 'monthly', priority_tier: 2, archetype: 'freelancer' },
  { name: 'Internet', default_amount: 2000, frequency: 'monthly', priority_tier: 2, archetype: 'freelancer' },
  { name: 'Software Subscriptions', default_amount: 3000, frequency: 'monthly', priority_tier: 3, archetype: 'freelancer' },
  { name: 'Professional Development', default_amount: 2000, frequency: 'monthly', priority_tier: 3, archetype: 'freelancer' },
  { name: 'Coworking Space', default_amount: 5000, frequency: 'monthly', priority_tier: 3, archetype: 'freelancer' },
  { name: 'Dining Out', default_amount: 4000, frequency: 'monthly', priority_tier: 4, archetype: 'freelancer' },
  { name: 'Rent/Mortgage', default_amount: 30000, frequency: 'monthly', priority_tier: 1, archetype: 'family' },
  { name: 'Groceries', default_amount: 5000, frequency: 'weekly', priority_tier: 1, archetype: 'family' },
  { name: 'Utilities', default_amount: 5000, frequency: 'monthly', priority_tier: 2, archetype: 'family' },
  { name: 'Childcare', default_amount: 10000, frequency: 'monthly', priority_tier: 2, archetype: 'family' },
  { name: 'Insurance', default_amount: 8000, frequency: 'monthly', priority_tier: 2, archetype: 'family' },
  { name: 'Education', default_amount: 6000, frequency: 'monthly', priority_tier: 3, archetype: 'family' },
  { name: 'Savings', default_amount: 5000, frequency: 'monthly', priority_tier: 3, archetype: 'family' },
  { name: 'Family Entertainment', default_amount: 3000, frequency: 'monthly', priority_tier: 4, archetype: 'family' },
  { name: 'Office / Shop Rent', default_amount: 25000, frequency: 'monthly', priority_tier: 1, archetype: 'businessman' },
  { name: 'Inventory & Supplies', default_amount: 15000, frequency: 'monthly', priority_tier: 1, archetype: 'businessman' },
  { name: 'Staff Payroll', default_amount: 40000, frequency: 'monthly', priority_tier: 1, archetype: 'businessman' },
  { name: 'Business Utilities', default_amount: 8000, frequency: 'monthly', priority_tier: 2, archetype: 'businessman' },
  { name: 'Business Insurance', default_amount: 6000, frequency: 'monthly', priority_tier: 2, archetype: 'businessman' },
  { name: 'Marketing & Ads', default_amount: 10000, frequency: 'monthly', priority_tier: 3, archetype: 'businessman' },
  { name: 'Equipment / Upgrades', default_amount: 12000, frequency: 'monthly', priority_tier: 3, archetype: 'businessman' },
  { name: 'Business Travel', default_amount: 5000, frequency: 'monthly', priority_tier: 4, archetype: 'businessman' },
  { name: 'Rent', default_amount: 18000, frequency: 'monthly', priority_tier: 1, archetype: 'worker' },
  { name: 'Groceries', default_amount: 4000, frequency: 'weekly', priority_tier: 1, archetype: 'worker' },
  { name: 'Commute / Fuel', default_amount: 3500, frequency: 'monthly', priority_tier: 1, archetype: 'worker' },
  { name: 'Utilities', default_amount: 4000, frequency: 'monthly', priority_tier: 2, archetype: 'worker' },
  { name: 'Phone & Internet', default_amount: 2000, frequency: 'monthly', priority_tier: 2, archetype: 'worker' },
  { name: 'Health Insurance', default_amount: 4500, frequency: 'monthly', priority_tier: 2, archetype: 'worker' },
  { name: 'Savings', default_amount: 5000, frequency: 'monthly', priority_tier: 3, archetype: 'worker' },
  { name: 'Loan / EMI', default_amount: 8000, frequency: 'monthly', priority_tier: 3, archetype: 'worker' },
  { name: 'Dining & Entertainment', default_amount: 3500, frequency: 'monthly', priority_tier: 4, archetype: 'worker' },
  { name: 'Shopping', default_amount: 2500, frequency: 'monthly', priority_tier: 4, archetype: 'worker' },
];

async function seedPresetCategories() {
  for (const category of PRESET_CATEGORIES) {
    await ExpenseCategory.findOrCreate({
      where: { name: category.name, archetype: category.archetype },
      defaults: category,
    });
  }
}

module.exports = {
  sequelize,
  User,
  Expense,
  Income,
  ExpenseCategory,
  Goal,
  Subscription,
  Investment,
  seedPresetCategories,
};
