const { getAllServices } = require("../registry/serviceRegistry");
const { performHealthCheck } = require("../checker/healthChecker");
const { evaluateServiceState } = require("../state/stateEvaluator");
const { dispatchAlert } = require("../alerts/alertDispatcher");
const { updateStateChangeInDb } = require("../db/serviceQueries");
const { saveCheck } = require("../db/checkQueries");
const { startIncident, resolveIncident } = require("../db/incidentQueries");


const SCHEDULER_TICK_MS = 1000;

function startScheduler() {
  setInterval(() => {
    const now = Date.now();

    getAllServices().forEach(async service => {
      if (!service.lastCheckedAt) {
        await triggerCheck(service);
        return;
      }

      const elapsedSeconds =
        (now - service.lastCheckedAt.getTime()) / 1000;

      if (elapsedSeconds >= service.checkInterval) {
        await triggerCheck(service);
      }
    });
  }, SCHEDULER_TICK_MS);
}

async function triggerCheck(service) {
  service.lastCheckedAt = new Date();

  console.log(
    `[CHECK] Running check for ${service.name} (${service.url})`
  );

  const result = await performHealthCheck(service);

  await saveCheck(service, result);

  const stateChange = evaluateServiceState(service, result);

  if (stateChange.transitioned) {
    if (stateChange.newStatus === "DOWN") {
      service.downtimeStartedAt = new Date();
      await startIncident(service.id, service.downtimeStartedAt)
    }

    if (stateChange.newStatus === "UP") {
      const resolvedAt = new Date();
      service.lastDowntime = formatDowntime(
        service.downtimeStartedAt,
        resolvedAt
      );
      service.downtimeStartedAt = null;
      await resolveIncident(service.id, resolvedAt, service.lastDowntime);
    }

    await updateStateChangeInDb(service);

    await dispatchAlert(service, stateChange, result);
  }

  logCheckResult(service, result, stateChange);
}

function formatDowntime(start, end) {
  if (!start) return 0;
  const seconds = Math.floor((end - start) / 1000);
  return seconds;
}

function logCheckResult(service, result, stateChange) {
  let baseLog = `[RESULT] ${service.name}`;

  if (result.success) {
    baseLog += ` UP | ${result.statusCode} | ${result.latency}ms`;
  } else {
    baseLog += ` FAIL (${service.consecutiveFailures}) | ${result.error}`;
  }

  if (stateChange.transitioned) {
    baseLog += ` 🔁 STATE → ${stateChange.newStatus}`;
  }

  console.log(baseLog);
}

module.exports = { startScheduler };