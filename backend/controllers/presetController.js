const { ExpenseCategory } = require('../models');

const VALID_ARCHETYPES = ['student', 'freelancer', 'family', 'businessman', 'worker'];

async function getPreset(req, res, next) {
  try {
    const archetype = req.params.archetype;
    if (!VALID_ARCHETYPES.includes(archetype)) {
      return res.status(404).json({ error: 'Preset not found.' });
    }

    const categories = await ExpenseCategory.findAll({
      where: { archetype },
      order: [['priority_tier', 'ASC'], ['name', 'ASC']],
    });

    res.json(
      categories.map((category) => ({
        name: category.name,
        default_amount: Number(category.default_amount),
        frequency: category.frequency,
        priority_tier: category.priority_tier,
      }))
    );
  } catch (err) {
    next(err);
  }
}

module.exports = { getPreset };
