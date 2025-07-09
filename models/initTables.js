const pool = require("./db");

async function createTables() {
  try {
    // await pool.query(`
    //   CREATE TABLE IF NOT EXISTS likes (
    //     id SERIAL PRIMARY KEY,
    //     user_id INTEGER REFERENCES users2(id) ON DELETE CASCADE,
    //     content_type VARCHAR(10) CHECK (content_type IN ('article', 'video')),
    //     content_id INTEGER NOT NULL,
    //     created_at TIMESTAMP DEFAULT NOW(),
    //     UNIQUE(user_id, content_type, content_id)
    //   );
    // `);

    // await pool.query(`
    //   CREATE TABLE IF NOT EXISTS comments (
    //     id SERIAL PRIMARY KEY,
    //     user_id INTEGER REFERENCES users2(id) ON DELETE CASCADE,
    //     content_type VARCHAR(10) CHECK (content_type IN ('article', 'video')),
    //     content_id INTEGER NOT NULL,
    //     comment TEXT NOT NULL,
    //     created_at TIMESTAMP DEFAULT NOW()
    //   );
    // `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS push_subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT NOT NULL,
        keys TEXT NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id SERIAL PRIMARY KEY,
        endpoint TEXT UNIQUE,
        keys JSONB,
        created_at TIMESTAMP
      );
    `);

    // await pool.query(`
    //   CREATE TABLE devotionals (
    //     id SERIAL PRIMARY KEY,
    //     title TEXT NOT NULL,
    //     scripture TEXT,
    //     content TEXT NOT NULL,
    //     image_url TEXT,
    //     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    //   );
      // `);
      
      await pool.query(
          `CREATE TABLE IF NOT EXISTS company_info(
            id SERIAL PRIMARY KEY,
            logo_url TEXT NOT NULL,
            vision TEXT,
            mission TEXT,
            history TEXT,
            hero_image_url TEXT ,
            company_name TEXT NOT NULL,
            marquee_message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  
        );`
      );
    console.log(
      "✅ likes, comments and push_subscriptions are ready tables are ready."
    );
  } catch (err) {
    console.error("❌ Error creating tables:", err.message);
  }
}

module.exports = createTables;
