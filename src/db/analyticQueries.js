const pool = require("./database");

async function getServiceAnalytics(serviceId, from, to) {
  const query = `
    SELECT
      COUNT(*) AS total_checks,
      COUNT(*) FILTER (WHERE success = true) AS successful_checks,
      ROUND(
        (COUNT(*) FILTER (WHERE success = true)::decimal / NULLIF(COUNT(*), 0)) * 100,
        2
      ) AS uptime_percentage,
      ROUND(AVG(latency_ms) FILTER (WHERE success = true)) AS avg_latency_ms
    FROM checks
    WHERE service_id = $1
      AND timestamp BETWEEN $2 AND $3;
  `;

  const { rows } = await pool.query(query, [serviceId, from, to]);
  return rows[0];
}

async function getIncidentHistory(serviceId, from, to) {
  const query = `
    SELECT
      id,
      started_at,
      resolved_at,
      duration_seconds
    FROM incidents
    WHERE service_id = $1
      AND started_at <= $3
      AND (resolved_at IS NULL OR resolved_at >= $2)
    ORDER BY started_at DESC;
  `;

  const { rows } = await pool.query(query, [serviceId, from, to]);
  return rows;
}

module.exports = { getServiceAnalytics, getIncidentHistory };