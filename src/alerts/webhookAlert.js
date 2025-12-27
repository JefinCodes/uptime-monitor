const axios = require("axios");

async function sendWebhookAlert(webhookUrl, payload) {
  await axios.post(webhookUrl, payload, {
    timeout: 5000
  });
}

module.exports = { sendWebhookAlert };