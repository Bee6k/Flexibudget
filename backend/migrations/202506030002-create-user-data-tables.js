const { DataTypes } = require('sequelize');

/** @param {import('sequelize').QueryInterface} queryInterface */
async function up(queryInterface) {
  const tables = await queryInterface.showAllTables();
  const has = (name) => tables.includes(name) || tables.includes(name.toLowerCase());

  if (!has('goals')) {
    await queryInterface.createTable('goals', {
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
    target_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    current_amount: { type: DataTypes.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
    await queryInterface.addIndex('goals', ['user_id']);
  }

  if (!has('subscriptions')) {
    await queryInterface.createTable('subscriptions', {
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
    due_day: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
    await queryInterface.addIndex('subscriptions', ['user_id']);
  }

  if (!has('investments')) {
    await queryInterface.createTable('investments', {
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
    asset_type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'Other' },
    value: { type: DataTypes.DECIMAL(14, 2), allowNull: false },
    change_pct: { type: DataTypes.DECIMAL(6, 2), allowNull: false, defaultValue: 0 },
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  });
    await queryInterface.addIndex('investments', ['user_id']);
  }
}

/** @param {import('sequelize').QueryInterface} queryInterface */
async function down(queryInterface) {
  await queryInterface.dropTable('investments');
  await queryInterface.dropTable('subscriptions');
  await queryInterface.dropTable('goals');
}

module.exports = { up, down };
