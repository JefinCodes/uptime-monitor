const { getAllServices } = require("../registry/serviceRegistry");
const { performHealthCheck } = require("../checker/healthChecker");
const { evaluateServiceState } = require("../state/stateEvaluator");

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

  const stateChange = evaluateServiceState(service, result);

  logCheckResult(service, result, stateChange);
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