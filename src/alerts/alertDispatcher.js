const { sendEmailAlert } = require("./emailAlert");
const { sendWebhookAlert } = require("./webhookAlert");

async function dispatchAlert(service, stateChange, checkResult) {
  const timestamp = new Date().toISOString();

  if (stateChange.newStatus === "DOWN") {
    const message = `
SERVICE DOWN 🚨

Service: ${service.name}
URL: ${service.url}
Time: ${timestamp}
Error: ${checkResult.error || "Unknown"}
    `.trim();

    await Promise.allSettled([
      service.alertEmail &&
        sendEmailAlert({
          to: service.alertEmail,
          subject: `🚨 ${service.name} is DOWN`,
          body: message
        }),

      service.webhookUrl &&
        sendWebhookAlert(service.webhookUrl, {
          content: message
        })
    ]);
  }

  if (stateChange.newStatus === "UP") {
    const message = `
SERVICE RECOVERED ✅

Service: ${service.name}
URL: ${service.url}
Time: ${timestamp}
Downtime: ${service.lastDowntime || "N/A"}
    `.trim();

    await Promise.allSettled([
      service.alertEmail &&
        sendEmailAlert({
          to: service.alertEmail,
          subject: `✅ ${service.name} is UP`,
          body: message
        }),

      service.webhookUrl &&
        sendWebhookAlert(service.webhookUrl, {
          content: message
        })
    ]);
  }
}

module.exports = { dispatchAlert };