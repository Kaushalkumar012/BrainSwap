const db = require('./db');

/**
 * Migration script to add real-time features tables
 * Run: node migrate-realtime.js
 */
async function migrate() {
  try {
    console.log('🔄 Running real-time features migration...');

    // Create bot_conversations table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS bot_conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        user_message TEXT NOT NULL,
        bot_response TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_date (user_id, created_at DESC)
      )
    `);

    console.log('✅ bot_conversations table ready');

    // Verify existing tables
    const [tables] = await db.query("SHOW TABLES");
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    console.log('\n📊 Database tables:');
    tableNames.forEach(name => console.log(`  ✓ ${name}`));

    console.log('\n✅ Migration completed successfully!');
    console.log('🚀 Real-time features are now ready to use.');

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
