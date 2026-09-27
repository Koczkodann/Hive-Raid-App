/**
 * FF14 jobs organised by role category.
 * Used by views to populate the role dropdown and by controllers for validation.
 */
const ROLE_CATEGORIES = [
  {
    category: 'Tank',
    jobs: ['Paladin', 'Warrior', 'Dark Knight', 'Gunbreaker'],
  },
  {
    category: 'Healer',
    jobs: ['White Mage', 'Scholar', 'Astrologian', 'Sage'],
  },
  {
    category: 'Melee DPS',
    jobs: ['Monk', 'Dragoon', 'Ninja', 'Samurai', 'Reaper', 'Viper'],
  },
  {
    category: 'Physical Ranged DPS',
    jobs: ['Bard', 'Machinist', 'Dancer'],
  },
  {
    category: 'Magical Ranged DPS',
    jobs: ['Black Mage', 'Summoner', 'Red Mage', 'Pictomancer'],
  },
];

/** Flat list of every valid job name. */
const ALL_JOBS = ROLE_CATEGORIES.flatMap((cat) => cat.jobs);

module.exports = { ROLE_CATEGORIES, ALL_JOBS };
