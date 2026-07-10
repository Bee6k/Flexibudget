/**
 * Repair schema drift from sequelize.sync() + overlapping migrations:
 * - collapse duplicate unique indexes on users.email
 * - collapse duplicate user_id foreign keys on expenses/incomes
 * - enforce unique (name, archetype) on expense_categories
 */

/** @param {import('sequelize').QueryInterface} queryInterface */
async function up(queryInterface) {
  const sequelize = queryInterface.sequelize;

  await collapseEmailUniqueIndexes(sequelize);
  await collapseUserForeignKeys(sequelize, 'expenses', 'expenses_user_id_fk');
  await collapseUserForeignKeys(sequelize, 'incomes', 'incomes_user_id_fk');
  await ensureExpenseCategoryUnique(queryInterface, sequelize);
}

async function collapseEmailUniqueIndexes(sequelize) {
  const [rows] = await sequelize.query(`
    SHOW INDEX FROM users
    WHERE Column_name = 'email' AND Non_unique = 0
  `);
  const names = [...new Set(rows.map((row) => row.Key_name))];
  for (const name of names) {
    await sequelize.query(`ALTER TABLE users DROP INDEX \`${name}\``);
  }
  await sequelize.query(
    'ALTER TABLE users ADD UNIQUE INDEX users_email_unique (email)'
  );
}

async function listForeignKeys(sequelize, tableName) {
  const [rows] = await sequelize.query(
    `
    SELECT CONSTRAINT_NAME AS name
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = ?
      AND CONSTRAINT_TYPE = 'FOREIGN KEY'
    `,
    { replacements: [tableName] }
  );
  return rows.map((row) => row.name);
}

async function collapseUserForeignKeys(sequelize, tableName, keepName) {
  const existing = await listForeignKeys(sequelize, tableName);
  for (const name of existing) {
    await sequelize.query(`ALTER TABLE \`${tableName}\` DROP FOREIGN KEY \`${name}\``);
  }
  await sequelize.query(`
    ALTER TABLE \`${tableName}\`
      ADD CONSTRAINT \`${keepName}\`
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  `);
}

async function ensureExpenseCategoryUnique(queryInterface, sequelize) {
  await sequelize.query(`
    DELETE ec FROM expense_categories ec
    INNER JOIN expense_categories keep
      ON keep.name = ec.name
     AND keep.archetype = ec.archetype
     AND keep.id < ec.id
  `);

  const [indexes] = await sequelize.query(`
    SHOW INDEX FROM expense_categories
    WHERE Key_name = 'expense_categories_name_archetype_unique'
  `);
  if (indexes.length === 0) {
    await queryInterface.addIndex('expense_categories', ['name', 'archetype'], {
      unique: true,
      name: 'expense_categories_name_archetype_unique',
    });
  }
}

/** @param {import('sequelize').QueryInterface} queryInterface */
async function down(queryInterface) {
  const sequelize = queryInterface.sequelize;
  try {
    await queryInterface.removeIndex(
      'expense_categories',
      'expense_categories_name_archetype_unique'
    );
  } catch {
    /* ignore */
  }
  try {
    await sequelize.query('ALTER TABLE users DROP INDEX users_email_unique');
    await sequelize.query('ALTER TABLE users ADD UNIQUE INDEX email (email)');
  } catch {
    /* ignore */
  }
}

module.exports = { up, down };
