const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

async function ensureMigrationTable(sequelize) {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name VARCHAR(255) NOT NULL PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(sequelize) {
  const [rows] = await sequelize.query('SELECT name FROM schema_migrations');
  return new Set(rows.map((row) => row.name));
}

async function runMigrations(sequelize) {
  if (!fs.existsSync(MIGRATIONS_DIR)) return;

  await ensureMigrationTable(sequelize);
  const applied = await getAppliedMigrations(sequelize);
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.js'))
    .sort();

  for (const file of files) {
    if (applied.has(file)) continue;

    const migration = require(path.join(MIGRATIONS_DIR, file));
    if (typeof migration.up !== 'function') {
      throw new Error(`Migration ${file} is missing an up() function.`);
    }

    await migration.up(sequelize.getQueryInterface(), Sequelize);
    await sequelize.query('INSERT INTO schema_migrations (name) VALUES (?)', {
      replacements: [file],
    });
    console.log(`Applied migration: ${file}`);
  }
}

module.exports = { runMigrations };
