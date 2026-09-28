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

/**
 * Main raid party composition rules (Standard 8-man composition).
 * 2 Tanks, 2 Healers, 2 Melee DPS, 2 Range DPS (Physical + Magical).
 */
const BROAD_ROLES = ['Tank', 'Healer', 'Melee DPS', 'Range DPS'];

const ROLE_LIMITS = {
  'Tank': 2,
  'Healer': 2,
  'Melee DPS': 2,
  'Range DPS': 2,
};

/**
 * Map a specific FF14 job name to its lineup role bucket.
 */
function getBroadRole(job) {
  for (const cat of ROLE_CATEGORIES) {
    if (cat.jobs.includes(job)) {
      if (cat.category === 'Physical Ranged DPS' || cat.category === 'Magical Ranged DPS') {
        return 'Range DPS';
      }
      return cat.category;
    }
  }
  return 'Unknown';
}

/**
 * Dynamically partition a chronological roster into:
 * - Main Lineup (first 2 Tanks, 2 Healers, 2 Melee, 2 Range)
 * - Reserve / Bench (any excess players per role in FIFO queue order)
 *
 * When an admin removes a member from the main lineup, the next reserve
 * for that role automatically advances into the main squad without any manual migration.
 */
function partitionRoster(roster = []) {
  const counts = {
    'Tank': 0,
    'Healer': 0,
    'Melee DPS': 0,
    'Range DPS': 0,
  };
  const main = [];
  const reserve = [];

  for (const member of roster) {
    const broadRole = getBroadRole(member.role);
    const limit = ROLE_LIMITS[broadRole] || 2;

    if (counts[broadRole] < limit) {
      counts[broadRole]++;
      main.push({
        ...member,
        broadRole,
        isReserve: false,
        slotNumber: counts[broadRole],
      });
    } else {
      const queuePosition = reserve.filter((r) => r.broadRole === broadRole).length + 1;
      reserve.push({
        ...member,
        broadRole,
        isReserve: true,
        queuePosition,
      });
    }
  }

  // Structured slots showing filled and open slots
  const slots = {};
  for (const role of BROAD_ROLES) {
    slots[role] = [];
    const filled = main.filter((m) => m.broadRole === role);
    for (let i = 0; i < ROLE_LIMITS[role]; i++) {
      slots[role].push(filled[i] || null); // null = open slot
    }
  }

  return {
    main,
    reserve,
    slots,
    counts,
    totalMain: main.length,
    totalReserve: reserve.length,
    maxMain: 8,
  };
}

module.exports = {
  ROLE_CATEGORIES,
  ALL_JOBS,
  BROAD_ROLES,
  ROLE_LIMITS,
  getBroadRole,
  partitionRoster,
};
