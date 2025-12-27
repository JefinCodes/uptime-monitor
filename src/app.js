require("dotenv").config();
const express = require("express");
const { Service } = require("./models/service");
const { runMigrations } = require("./db/migrations");
const { loadServicesIntoMemory } = require("./startup/loadServices");
const { startScheduler } = require("./scheduler/scheduler");
const { addService, getAllServices, getServiceById, generateServiceId } = require("./registry/serviceRegistry");
const { insertService } = require("./db/serviceQueries");

const app = express();
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
      id: generateServiceId(),
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
  const service = getServiceById(Number(req.params.id));
  if (!service) {
    return res.status(404).json({ error: "Service not found" });
  }
  res.json(service);
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