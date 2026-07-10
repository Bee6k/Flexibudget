require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize } = require('../models');

(async () => {
  await sequelize.authenticate();
  const [tables] = await sequelize.query('SHOW TABLES');
  const names = tables.map((t) => Object.values(t)[0]);
  console.log('TABLES:', names.join(', '));

  for (const name of names) {
    const [cols] = await sequelize.query(`SHOW COLUMNS FROM \`${name}\``);
    const [idx] = await sequelize.query(`SHOW INDEX FROM \`${name}\``);
    const [fks] = await sequelize.query(
      `SELECT CONSTRAINT_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND REFERENCED_TABLE_NAME IS NOT NULL`,
      { replacements: [name] }
    );
    console.log(`\n== ${name} ==`);
    for (const c of cols) {
      console.log(
        `  col ${c.Field} | ${c.Type} | ${c.Null === 'NO' ? 'NOT NULL' : 'NULL'} | key=${c.Key || '-'} | default=${c.Default ?? 'NULL'}`
      );
    }
    const seen = new Set();
    for (const i of idx) {
      const key = `${i.Key_name}|${i.Non_unique ? 'non' : 'uniq'}|${i.Column_name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      console.log(`  idx ${key}`);
    }
    for (const f of fks) {
      console.log(
        `  fk ${f.CONSTRAINT_NAME}: ${f.COLUMN_NAME} -> ${f.REFERENCED_TABLE_NAME}.${f.REFERENCED_COLUMN_NAME}`
      );
    }
  }

  const [mig] = await sequelize.query('SELECT name, applied_at FROM schema_migrations ORDER BY applied_at');
  console.log('\n== schema_migrations ==');
  mig.forEach((m) => console.log(`  ${m.name} @ ${m.applied_at}`));

  await sequelize.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
