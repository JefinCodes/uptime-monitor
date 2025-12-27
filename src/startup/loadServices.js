const pool = require("../db/database");
const { Service } = require("../models/service");
const { addService, generateServiceId } = require("../registry/serviceRegistry");

async function loadServicesIntoMemory() {
  const result = await pool.query(`
    SELECT
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
    FROM services
  `);

  for (const row of result.rows) {
    const service = new Service({
      id: row.id,
      name: row.name,
      url: row.url,
      checkInterval: row.check_interval,
      timeout: row.timeout,
      failureThreshold: row.failure_threshold,
      successThreshold: row.success_threshold,
      alertEmail: row.alert_email,
      webhookUrl: row.webhook_url,

      state: row.state,
      lastCheckedAt: row.last_checked_at,
      downtimeStartedAt: row.downtime_started_at,
      lastDowntime: row.last_downtime
    });

    generateServiceId();

    addService(service);
  }

  console.log(`✅ Loaded ${result.rowCount} services into runtime memory`);
}

module.exports = { loadServicesIntoMemory };