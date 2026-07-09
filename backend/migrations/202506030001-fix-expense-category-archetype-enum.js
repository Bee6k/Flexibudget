/** @param {import('sequelize').QueryInterface} queryInterface */
async function up(queryInterface) {
  const tables = await queryInterface.showAllTables();
  const has = (name) => tables.includes(name) || tables.includes(name.toLowerCase());
  if (has('expense_categories')) {
    await queryInterface.sequelize.query(`
      ALTER TABLE expense_categories
      MODIFY archetype ENUM(
        'student', 'freelancer', 'family', 'businessman', 'worker', 'general'
      ) NOT NULL
    `);
  }
}

/** @param {import('sequelize').QueryInterface} queryInterface */
async function down(queryInterface) {
  await queryInterface.sequelize.query(`
    ALTER TABLE expense_categories
    MODIFY archetype ENUM(
      'student', 'freelancer', 'family', 'general'
    ) NOT NULL
  `);
}

module.exports = { up, down };
