const db = require('./db');

/**
 * Seed badges and achievements into the database
 * Run: node seed-badges.js
 */

const BADGES = [
  {
    name: 'First Skill',
    description: 'Added your first skill to your profile',
    icon_emoji: '🌟',
    rarity: 'Common',
    points_reward: 10,
    condition_type: 'skill_added',
    condition_value: 1,
  },
  {
    name: 'Learning Beginner',
    description: 'Completed your first skill exchange session',
    icon_emoji: '🎓',
    rarity: 'Common',
    points_reward: 20,
    condition_type: 'sessions_completed',
    condition_value: 1,
  },
  {
    name: 'Session Champion',
    description: 'Completed 5 skill exchange sessions',
    icon_emoji: '🚀',
    rarity: 'Rare',
    points_reward: 50,
    condition_type: 'sessions_completed',
    condition_value: 5,
  },
  {
    name: 'High Rater',
    description: 'Maintained a 4.5+ average rating from peers',
    icon_emoji: '⭐',
    rarity: 'Epic',
    points_reward: 100,
    condition_type: 'average_rating',
    condition_value: 45,
  },
  {
    name: 'Match Master',
    description: 'Connected with 10+ skill exchange partners',
    icon_emoji: '🤝',
    rarity: 'Rare',
    points_reward: 75,
    condition_type: 'active_matches',
    condition_value: 10,
  },
  {
    name: 'Collaborator',
    description: 'Completed a collaboration project',
    icon_emoji: '🏅',
    rarity: 'Epic',
    points_reward: 100,
    condition_type: 'collabs_completed',
    condition_value: 1,
  },
  {
    name: 'Chatbot Scholar',
    description: 'Had 50+ conversations with the AI chatbot',
    icon_emoji: '💬',
    rarity: 'Rare',
    points_reward: 50,
    condition_type: 'bot_conversations',
    condition_value: 50,
  },
  {
    name: 'Streak Master',
    description: 'Completed 3 sessions in a row without a break',
    icon_emoji: '🔥',
    rarity: 'Rare',
    points_reward: 75,
    condition_type: 'session_streak',
    condition_value: 3,
  },
  {
    name: 'Leaderboard King',
    description: 'Ranked in the top 10 leaderboard',
    icon_emoji: '👑',
    rarity: 'Legendary',
    points_reward: 150,
    condition_type: 'leaderboard_rank',
    condition_value: 10,
  },
  {
    name: 'Hall of Fame',
    description: 'Maintained a perfect 5.0 rating for 10 sessions',
    icon_emoji: '🎖️',
    rarity: 'Legendary',
    points_reward: 200,
    condition_type: 'perfect_rating',
    condition_value: 10,
  },
];

const ACHIEVEMENTS = [
  {
    name: 'First Steps',
    description: 'Add your first skill',
    type: 'Progression',
    target_value: 1,
    xp_reward: 25,
  },
  {
    name: 'Skill Collector',
    description: 'Add 10 different skills',
    type: 'Progression',
    target_value: 10,
    xp_reward: 100,
  },
  {
    name: 'Session Enthusiast',
    description: 'Complete 25 skill exchange sessions',
    type: 'Progression',
    target_value: 25,
    xp_reward: 250,
  },
  {
    name: 'Perfect Score',
    description: 'Receive a perfect 5-star rating',
    type: 'Challenge',
    target_value: 1,
    xp_reward: 150,
  },
  {
    name: 'Week Warrior',
    description: 'Log in for 7 consecutive days',
    type: 'Time-based',
    target_value: 7,
    xp_reward: 50,
  },
  {
    name: 'Social Butterfly',
    description: 'Connect with 5 different skill partners',
    type: 'Relationship',
    target_value: 5,
    xp_reward: 75,
  },
  {
    name: 'Project Complete',
    description: 'Finish a collaboration project',
    type: 'Collaboration',
    target_value: 1,
    xp_reward: 100,
  },
  {
    name: 'Rating Climber',
    description: 'Improve your rating from 1 to 5 stars',
    type: 'Performance',
    target_value: 5,
    xp_reward: 200,
  },
];

async function seedBadges() {
  try {
    console.log('🎮 Seeding badges and achievements...\n');

    // Clear existing badges and achievements
    await db.query('DELETE FROM badges');
    await db.query('DELETE FROM achievements');

    // Insert badges
    for (const badge of BADGES) {
      await db.query(
        `INSERT INTO badges (name, description, icon_emoji, rarity, points_reward, condition_type, condition_value)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          badge.name,
          badge.description,
          badge.icon_emoji,
          badge.rarity,
          badge.points_reward,
          badge.condition_type,
          badge.condition_value,
        ]
      );
    }
    console.log(`✅ Seeded ${BADGES.length} badges`);

    // Insert achievements
    for (const achievement of ACHIEVEMENTS) {
      await db.query(
        `INSERT INTO achievements (name, description, type, target_value, xp_reward)
         VALUES (?, ?, ?, ?, ?)`,
        [
          achievement.name,
          achievement.description,
          achievement.type,
          achievement.target_value,
          achievement.xp_reward,
        ]
      );
    }
    console.log(`✅ Seeded ${ACHIEVEMENTS.length} achievements`);

    // Verify seeded data
    const [badges] = await db.query('SELECT COUNT(*) as count FROM badges');
    const [achievements] = await db.query('SELECT COUNT(*) as count FROM achievements');

    console.log(`\n📊 Database status:`);
    console.log(`  ✓ ${badges[0].count} badges`);
    console.log(`  ✓ ${achievements[0].count} achievements`);

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seedBadges();
