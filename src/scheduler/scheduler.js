const { getAllServices } = require("../registry/serviceRegistry");

const SCHEDULER_TICK_MS = 1000;

function startScheduler() {
  setInterval(() => {
    const now = Date.now();

    getAllServices().forEach(service => {
      if (!service.lastCheckedAt) {
        triggerCheck(service);
        return;
      }

      const elapsedSeconds =
        (now - service.lastCheckedAt.getTime()) / 1000;

      if (elapsedSeconds >= service.checkInterval) {
        triggerCheck(service);
      }
    });
  }, SCHEDULER_TICK_MS);
}

function triggerCheck(service) {
  service.lastCheckedAt = new Date();
  console.log(
    `[SCHEDULER] Scheduling check for ${service.name} (${service.url})`
  );
}

module.exports = { startScheduler };