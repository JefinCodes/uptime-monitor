const axios = require("axios");

async function performHealthCheck(service) {
  const startTime = Date.now();

  try {
    const response = await axios.get(service.url, {
      timeout: service.timeout * 1000,
      validateStatus: () => true
    });

    const latency = Date.now() - startTime;

    return {
      success: response.status >= 200 && response.status < 400,
      statusCode: response.status,
      latency,
      error: null,
      timestamp: new Date()
    };
  } catch (err) {
    const latency = Date.now() - startTime;

    return {
      success: false,
      statusCode: null,
      latency,
      error: err.code || err.message,
      timestamp: new Date()
    };
  }
}

module.exports = { performHealthCheck };