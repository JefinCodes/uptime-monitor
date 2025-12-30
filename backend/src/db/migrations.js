const pool = require("./database");

async function runMigrations() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      url TEXT NOT NULL,

      check_interval INTEGER NOT NULL DEFAULT 60,
      timeout INTEGER NOT NULL DEFAULT 5,
      failure_threshold INTEGER NOT NULL DEFAULT 3,
      success_threshold INTEGER NOT NULL DEFAULT 2,

      alert_email TEXT,
      webhook_url TEXT,

      state TEXT NOT NULL DEFAULT 'UNKNOWN',

      last_checked_at TIMESTAMPTZ,
      downtime_started_at TIMESTAMPTZ,
      last_downtime INTEGER DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS checks (
      id SERIAL PRIMARY KEY,
      service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
      timestamp TIMESTAMPTZ NOT NULL,
      success BOOLEAN NOT NULL,
      status_code INTEGER,
      latency_ms INTEGER,
      error TEXT
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS incidents (
      id SERIAL PRIMARY KEY,
      service_id TEXT REFERENCES services(id) ON DELETE CASCADE,
      started_at TIMESTAMPTZ NOT NULL,
      resolved_at TIMESTAMPTZ,
      duration_seconds INTEGER
    );
  `);

  console.log("✅ PostgreSQL migrations completed");
}

module.exports = { runMigrations };