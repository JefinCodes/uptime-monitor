class Service {
  constructor({
    id,
    name,
    url,
    checkInterval,
    timeout,
    failureThreshold,
    successThreshold,
    alertEmail,
    webhookUrl,
    state = "UNKNOWN",
    lastCheckedAt = null,
    downtimeStartedAt = null,
    lastDowntime = 0
  }) {
    this.id = id;
    this.name = name;
    this.url = url;

    this.checkInterval = checkInterval;
    this.timeout = timeout;
    this.failureThreshold = failureThreshold;
    this.successThreshold = successThreshold;
    this.alertEmail = alertEmail;
    this.webhookUrl = webhookUrl;

    this.state = state;
    this.consecutiveFailures = 0;
    this.consecutiveSuccesses = 0;
    this.lastCheckedAt = lastCheckedAt;
    this.downtimeStartedAt = downtimeStartedAt;
    this.lastDowntime = lastDowntime;
  }
}

module.exports = { Service };