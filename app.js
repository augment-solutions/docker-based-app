const express = require('express');
const { Pool } = require('pg');
const { createClient } = require('redis');

const app = express();
const PORT = 8080;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (error) => {
  console.error('Redis Client Error', error);
});

async function startServer() {
  await redisClient.connect();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS visit_logs (
      id SERIAL PRIMARY KEY,
      visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  app.get('/', async (request, response) => {
    try {
      const currentHits = await redisClient.incr('page_views');

      await pool.query('INSERT INTO visit_logs DEFAULT VALUES');

      const dbResult = await pool.query('SELECT COUNT(*) FROM visit_logs');
      const totalDbLogs = dbResult.rows[0].count;

      response.json({
        message: 'Hello from Dockerized Node.js!',
        redis_page_views: currentHits,
        postgres_total_logs: parseInt(totalDbLogs, 10),
        timestamp: new Date(),
      });
    } catch (error) {
      console.error(error);
      response.status(500).json({ error: 'Database communication failed' });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server is running internally on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
