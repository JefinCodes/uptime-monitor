function evaluateServiceState(service, checkResult) {
  const failureThreshold = service.failureThreshold;
  const recoveryThreshold = service.successThreshold;

  if (checkResult.success) {
    service.consecutiveSuccesses += 1;
    service.consecutiveFailures = 0;

    if (
      service.state === "DOWN" &&
      service.consecutiveSuccesses >= recoveryThreshold
    ) {
      service.state = "UP";
      return { transitioned: true, newStatus: "UP" };
    }

    if (service.state === "UNKNOWN") {
      service.state = "UP";
      return { transitioned: true, newStatus: "UP" };
    }

    return { transitioned: false };
  }

  service.consecutiveFailures += 1;
  service.consecutiveSuccesses = 0;

  if (
    service.state !== "DOWN" &&
    service.consecutiveFailures >= failureThreshold
  ) {
    service.state = "DOWN";
    return { transitioned: true, newStatus: "DOWN" };
  }

  return { transitioned: false };
}

module.exports = { evaluateServiceState };