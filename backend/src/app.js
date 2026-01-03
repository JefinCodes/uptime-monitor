require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { Service } = require("./models/service");
const { runMigrations } = require("./db/migrations");
const { loadServicesIntoMemory } = require("./startup/loadServices");
const { startScheduler } = require("./scheduler/scheduler");
const { addService, getAllServices, getServiceById } = require("./registry/serviceRegistry");
const { insertService } = require("./db/serviceQueries");
const { getServiceAnalytics, getIncidentHistory } = require("./db/analyticQueries");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://jefincodes-uptime-monitor.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: false
  })
);

app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
  res.json({ status: "Uptime Monitor running" });
});

app.post("/services", async (req, res) => {
  try {
    const {
      name,
      url,
      checkInterval = 60,
      timeout = 5,
      failureThreshold = 3,
      successThreshold = 2,
      alertEmail = null,
      webhookUrl = null
    } = req.body;

    if (!name || !url) {
      return res.status(400).json({ error: "name and url are required" });
    }

    const service = new Service({
      id: uuidv4(),
      name,
      url,
      checkInterval,
      timeout,
      failureThreshold,
      successThreshold,
      alertEmail,
      webhookUrl
    });

    await insertService(service);

    addService(service);

    res.status(201).json(service);
  } catch (err) {
    res.status(500).json({
      error: "Failed to create service"
    });
  }
});

app.get("/services", (req, res) => {
  res.json(getAllServices());
});

app.get("/services/:id", (req, res) => {
  const service = getServiceById(req.params.id);
  if (!service) {
    return res.status(404).json({ error: "Service not found" });
  }
  res.json(service);
});

app.get("/api/services/:serviceId/analytics", async (req, res) => {
  try{
    const { serviceId } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: "from and to are required" });
    }

    const analytics = await getServiceAnalytics(serviceId, from, to);

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

app.get("/api/services/:serviceId/incidents", async (req, res) => {
  try{
    const { serviceId } = req.params;
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: "from and to are required" });
    }

    const incidents = await getIncidentHistory(serviceId, from, to);

    res.json(incidents);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch incidents" });
  }
});

async function startup() {
  try {
    console.log("🔧 Running database migrations...");
    await runMigrations();

    console.log("📥 Loading services into memory...");
    await loadServicesIntoMemory();

    console.log("⏱️ Starting scheduler...");
    startScheduler();

    console.log("🚀 Application startup completed");
  } catch (err) {
    console.error("❌ Startup failed:", err);
    process.exit(1);
  }
}

async function startServer() {
  await startup();

  app.listen(PORT, () => {
    console.log(`Uptime Monitor running on http://localhost:${PORT}`);
  });
}

startServer();