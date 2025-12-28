const pool = require("./database");

async function startIncident(serviceId, startedAt) {
  await pool.query(
    `
    INSERT INTO incidents (service_id, started_at)
    VALUES ($1, $2)
    `,
    [serviceId, startedAt]
  );
}

async function resolveIncident(serviceId, resolvedAt, durationSeconds) {
  const result = await pool.query(
    `
    UPDATE incidents
    SET resolved_at = $1,
        duration_seconds = $2
    WHERE service_id = $3
      AND resolved_at IS NULL
    `,
    [resolvedAt, durationSeconds, serviceId]
  );

  if (result.rowCount === 0) {
    console.log(`No active incident found for service_id=${serviceId}`);
  }
}

module.exports = { startIncident, resolveIncident };