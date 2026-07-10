const { DataTypes } = require('sequelize');

/** @param {import('sequelize').QueryInterface} queryInterface */
async function up(queryInterface) {
  const tables = await queryInterface.showAllTables();
  const has = (name) => tables.includes(name) || tables.includes(name.toLowerCase());

  if (!has('users')) {
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(120), allowNull: false },
      email: { type: DataTypes.STRING(255), allowNull: false },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      current_balance: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      archetype: { type: DataTypes.STRING(32), allowNull: true },
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
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    });
    await queryInterface.addIndex('users', ['email'], {
      unique: true,
      name: 'users_email_unique',
    });
  }

  if (!has('expense_categories')) {
    await queryInterface.createTable('expense_categories', {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING(100), allowNull: false },
      default_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      frequency: {
        type: DataTypes.ENUM('weekly', 'monthly', 'yearly'),
        allowNull: true,
      },
      priority_tier: { type: DataTypes.INTEGER, allowNull: true },
      archetype: {
        type: DataTypes.ENUM('student', 'freelancer', 'family', 'businessman', 'worker', 'general'),
        allowNull: false,
      },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    });
    await queryInterface.addIndex('expense_categories', ['name', 'archetype'], {
      unique: true,
      name: 'expense_categories_name_archetype_unique',
    });
  }

  if (!has('expenses')) {
    await queryInterface.createTable('expenses', {
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
      name: { type: DataTypes.STRING(100), allowNull: false },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      frequency: {
        type: DataTypes.ENUM('weekly', 'monthly', 'yearly', 'one-time'),
        allowNull: false,
      },
      priority_tier: { type: DataTypes.INTEGER, allowNull: false },
      due_date: { type: DataTypes.DATEONLY, allowNull: true },
      is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    });
    await queryInterface.addIndex('expenses', ['user_id']);
    await queryInterface.addIndex('expenses', ['user_id', 'priority_tier']);
  }

  if (!has('incomes')) {
    await queryInterface.createTable('incomes', {
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
      source_name: { type: DataTypes.STRING(100), allowNull: false },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      expected_date: { type: DataTypes.DATEONLY, allowNull: false },
      is_recurring: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    });
    await queryInterface.addIndex('incomes', ['user_id']);
    await queryInterface.addIndex('incomes', ['user_id', 'expected_date']);
  }
}

/** @param {import('sequelize').QueryInterface} queryInterface */
async function down(queryInterface) {
  await queryInterface.dropTable('incomes');
  await queryInterface.dropTable('expenses');
  await queryInterface.dropTable('expense_categories');
  await queryInterface.dropTable('users');
}

module.exports = { up, down };
