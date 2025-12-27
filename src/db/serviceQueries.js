const pool = require("./database");

async function insertService(service) {
  const query = `
    INSERT INTO services (
      id,
      name,
      url,
      check_interval,
      timeout,
      failure_threshold,
      success_threshold,
      alert_email,
      webhook_url,
      state,
      last_checked_at,
      downtime_started_at,
      last_downtime
    )
    VALUES (
      $1, $2, $3,
      $4, $5, $6, $7,
      $8, $9,
      $10,
      $11, $12, $13
    )
  `;

  const values = [
    service.id,
    service.name,
    service.url,

    service.checkInterval,
    service.timeout,
    service.failureThreshold,
    service.successThreshold,

    service.alertEmail,
    service.webhookUrl,

    service.state,

    service.lastCheckedAt,
    service.downtimeStartedAt,
    service.lastDowntime
  ];

  try {
    await pool.query(query, values);
  } catch (err) {
    console.error(`❌ Failed to insert service [${service.id}]`, err);
    throw err;
  }
}

async function updateStateChangeInDb(service) {
  const query = `
    UPDATE services
    SET
      state = $1,
      last_checked_at = $2,
      downtime_started_at = $3,
      last_downtime = $4
    WHERE id = $5
  `;

  const values = [
    service.state,
    service.lastCheckedAt,
    service.downtimeStartedAt,
    service.lastDowntime,
    service.id
  ];

  try {
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      throw new Error(`Service not found in DB: ${service.id}`);
    }
  } catch (err) {
    console.error(`❌ Failed to update state for service [${service.id}]`, err);
  }
}

module.exports = { insertService, updateStateChangeInDb };