const { DataTypes } = require('sequelize');

/** @param {import('sequelize').QueryInterface} queryInterface */
async function up(queryInterface, Sequelize) {
  const usersDesc = await queryInterface.describeTable('users');
  if (!usersDesc.token_version) {
    await queryInterface.addColumn('users', 'token_version', {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0,
    });
  }

  // Only add named FKs when the table has no user_id FK yet (avoid duplicates
  // alongside Sequelize-generated *_ibfk_* constraints from older sync()).
  const ensureUserFk = async (table, constraintName) => {
    const [rows] = await queryInterface.sequelize.query(
      `
      SELECT CONSTRAINT_NAME AS name
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = 'user_id'
        AND REFERENCED_TABLE_NAME = 'users'
      `,
      { replacements: [table] }
    );
    if (rows.length > 0) return;
    await queryInterface.sequelize.query(`
      ALTER TABLE \`${table}\`
        ADD CONSTRAINT \`${constraintName}\`
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    `);
  };

  await ensureUserFk('expenses', 'expenses_user_id_fk');
  await ensureUserFk('incomes', 'incomes_user_id_fk');

  try {
    // Remove duplicate presets before enforcing uniqueness
    await queryInterface.sequelize.query(`
      DELETE ec FROM expense_categories ec
      INNER JOIN expense_categories keep
        ON keep.name = ec.name
       AND keep.archetype = ec.archetype
       AND keep.id < ec.id
    `);
    await queryInterface.addIndex('expense_categories', ['name', 'archetype'], {
      unique: true,
      name: 'expense_categories_name_archetype_unique',
    });
  } catch (err) {
    const msg = String(err.message || err);
    if (!/Duplicate|already exists/i.test(msg)) {
      console.warn(`Skipping expense_categories unique index: ${msg}`);
    }
  }
}

/** @param {import('sequelize').QueryInterface} queryInterface */
async function down(queryInterface) {
  try {
    await queryInterface.removeIndex('expense_categories', 'expense_categories_name_archetype_unique');
  } catch {
    /* ignore */
  }
  try {
    await queryInterface.sequelize.query('ALTER TABLE expenses DROP FOREIGN KEY expenses_user_id_fk');
  } catch {
    /* ignore */
  }
  try {
    await queryInterface.sequelize.query('ALTER TABLE incomes DROP FOREIGN KEY incomes_user_id_fk');
  } catch {
    /* ignore */
  }
  const usersDesc = await queryInterface.describeTable('users');
  if (usersDesc.token_version) {
    await queryInterface.removeColumn('users', 'token_version');
  }
}

module.exports = { up, down };
