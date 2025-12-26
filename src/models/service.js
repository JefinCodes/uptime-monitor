const ServiceState = {
  UP: "UP",
  UNKNOWN: "UNKNOWN",
  DOWN: "DOWN"
};

class Service {
  constructor({
    id,
    name,
    url,
    checkInterval,
    timeout,
    failureThreshold,
    successThreshold
  }) {
    this.id = id;
    this.name = name;
    this.url = url;

    this.checkInterval = checkInterval;
    this.timeout = timeout;
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;

    this.state = ServiceState.UNKNOWN;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastCheckedAt = null;
  }
}

module.exports = { Service, ServiceState };