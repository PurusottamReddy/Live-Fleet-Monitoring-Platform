const mysql = require('mysql2/promise');

async function initPool() {
  const {
    MYSQL_HOST,
    MYSQL_PORT = 3306,
    MYSQL_USER,
    MYSQL_PASSWORD,
    MYSQL_DATABASE,
  } = process.env;
  try {
    const dbName = MYSQL_DATABASE || 'okdriver';
    try {
      const pool = mysql.createPool({
        host: MYSQL_HOST || 'localhost',
        port: Number(MYSQL_PORT),
        user: MYSQL_USER || 'root',
        password: MYSQL_PASSWORD || '',
        database: dbName,
        waitForConnections: true,
        connectionLimit: 10,
      });
      await pool.query('SELECT 1');
      return pool;
    } catch (err) {
      if (err && err.code === 'ER_BAD_DB_ERROR') {
        const conn = await mysql.createConnection({
          host: MYSQL_HOST || 'localhost',
          port: Number(MYSQL_PORT),
          user: MYSQL_USER || 'root',
          password: MYSQL_PASSWORD || '',
        });
        await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await conn.end();
        const pool = mysql.createPool({
          host: MYSQL_HOST || 'localhost',
          port: Number(MYSQL_PORT),
          user: MYSQL_USER || 'root',
          password: MYSQL_PASSWORD || '',
          database: dbName,
          waitForConnections: true,
          connectionLimit: 10,
        });
        await pool.query('SELECT 1');
        return pool;
      }
      throw err;
    }
  } catch (e) {
    console.warn(`MySQL not configured or unreachable (${e && e.code ? e.code : 'unknown'}) ; running without DB`);
    return null;
  }
}

async function ensureSchema(pool) {
  if (!pool) return;
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS drivers (
      id INT PRIMARY KEY,
      name VARCHAR(64) NOT NULL,
      is_active TINYINT DEFAULT 1
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS trips (
      id INT PRIMARY KEY,
      driver_id INT NOT NULL,
      started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ended_at TIMESTAMP NULL,
      risk_level VARCHAR(16) DEFAULT 'Safe',
      violations INT DEFAULT 0,
      FOREIGN KEY (driver_id) REFERENCES drivers(id)
    )
  `);

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS events (
      id INT AUTO_INCREMENT PRIMARY KEY,
      driver_id INT NOT NULL,
      trip_id INT NOT NULL,
      event_type VARCHAR(32) NOT NULL,
      speed INT NOT NULL,
      risk_score INT NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (driver_id) REFERENCES drivers(id),
      FOREIGN KEY (trip_id) REFERENCES trips(id)
    )
  `);
}

module.exports = { initPool, ensureSchema };
