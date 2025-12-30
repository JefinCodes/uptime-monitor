const pool = require("./database");

async function saveCheck(service, result) {
  await pool.query(
    `
    INSERT INTO checks (
      service_id,
      timestamp,
      success,
      status_code,
      latency_ms,
      error
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      service.id,
      result.timestamp,
      result.success,
      result.statusCode,
      result.latency,
      result.error
    ]
  );
}

module.exports = { saveCheck };