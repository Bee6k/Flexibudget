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

  // Best-effort FKs for DBs created via sequelize.sync without references.
  // Ignore errors if constraints already exist or engine cannot add them.
  const addFk = async (table, name, sql) => {
    try {
      await queryInterface.sequelize.query(sql);
    } catch (err) {
      const msg = String(err.message || err);
      if (!/Duplicate|already exists|ER_FK_DUP_NAME|ER_CANT_CREATE_TABLE/i.test(msg)) {
        console.warn(`Skipping FK ${name} on ${table}: ${msg}`);
      }
    }
  };

  await addFk(
    'expenses',
    'expenses_user_id_fk',
    `ALTER TABLE expenses
      ADD CONSTRAINT expenses_user_id_fk
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
  );
  await addFk(
    'incomes',
    'incomes_user_id_fk',
    `ALTER TABLE incomes
      ADD CONSTRAINT incomes_user_id_fk
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
  );

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
