const db = require('./db');

/**
 * Migration script for Gamification & Engagement features
 * Adds tables for badges, achievements, XP system, and leaderboard
 * Run: node migrate-gamification.js
 */
async function migrate() {
  try {
    console.log('🎮 Running gamification migration...');

    // 1. Create badges table
    await db.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        icon_emoji VARCHAR(10) NOT NULL,
        rarity ENUM('Common', 'Rare', 'Epic', 'Legendary') DEFAULT 'Common',
        points_reward INT DEFAULT 0,
        condition_type VARCHAR(50),
        condition_value INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ badges table created');

    // 2. Create user_badges table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        badge_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_badge (user_id, badge_id)
      )
    `);
    console.log('✅ user_badges table created');

    // 3. Create achievements table
    await db.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        type ENUM('Progression', 'Challenge', 'Time-based', 'Relationship', 'Collaboration', 'Performance') DEFAULT 'Progression',
        target_value INT DEFAULT 0,
        xp_reward INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ achievements table created');

    // 4. Create user_achievements table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        achievement_id INT NOT NULL,
        progress INT DEFAULT 0,
        is_completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_achievement (user_id, achievement_id)
      )
    `);
    console.log('✅ user_achievements table created');

    // 5. Create user_xp_log table
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_xp_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        xp_amount INT NOT NULL,
        reason VARCHAR(200),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, created_at DESC)
      )
    `);
    console.log('✅ user_xp_log table created');

    // 6. Create leaderboard_cache table (for performance)
    await db.query(`
      CREATE TABLE IF NOT EXISTS leaderboard_cache (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        user_rank INT NOT NULL,
        score INT DEFAULT 0,
        user_level INT DEFAULT 1,
        total_xp INT DEFAULT 0,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_sessions INT DEFAULT 0,
        badge_count INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_rank (user_rank),
        INDEX idx_score (score DESC)
      )
    `);
    console.log('✅ leaderboard_cache table created');

    // 7. Alter users table to add gamification fields
    try {
      await db.query(`ALTER TABLE users ADD COLUMN level INT DEFAULT 1`);
      console.log('✅ users.level field added');
    } catch (err) {
      if (!err.message.includes('Duplicate column')) {
        throw err;
      }
      console.log('✅ users.level field already exists');
    }

    try {
      await db.query(`ALTER TABLE users ADD COLUMN total_xp INT DEFAULT 0`);
      console.log('✅ users.total_xp field added');
    } catch (err) {
      if (!err.message.includes('Duplicate column')) {
        throw err;
      }
      console.log('✅ users.total_xp field already exists');
    }

    try {
      await db.query(`ALTER TABLE users ADD COLUMN current_xp INT DEFAULT 0`);
      console.log('✅ users.current_xp field added');
    } catch (err) {
      if (!err.message.includes('Duplicate column')) {
        throw err;
      }
      console.log('✅ users.current_xp field already exists');
    }

    try {
      await db.query(`ALTER TABLE users ADD COLUMN last_level_up TIMESTAMP NULL`);
      console.log('✅ users.last_level_up field added');
    } catch (err) {
      if (!err.message.includes('Duplicate column')) {
        throw err;
      }
      console.log('✅ users.last_level_up field already exists');
    }

    // 8. Verify all tables
    const [tables] = await db.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log('\n📊 Database tables:');
    tableNames.forEach(name => console.log(`  ✓ ${name}`));

    console.log('\n✅ Gamification migration completed successfully!');
    console.log('🎮 Ready to seed badges and achievements.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
