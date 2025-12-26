const express = require("express");
const { Service } = require("./models/service");
const {
  addService,
  getAllServices,
  getServiceById,
  generateServiceId
} = require("./registry/serviceRegistry");
const { startScheduler } = require("./scheduler/scheduler");

const app = express();
app.use(express.json());

const PORT = 3000;

app.get("/", (req, res) => {
  res.json({ status: "Uptime Monitor running" });
});

app.post("/services", (req, res) => {
  const {
    name,
    url,
    checkInterval = 60,
    timeout = 5,
    failureThreshold = 3,
    successThreshold = 2
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
    successThreshold
  });

  addService(service);
  res.status(201).json(service);
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

app.listen(PORT, () => {
  console.log(`Uptime Monitor running on http://localhost:${PORT}`);
  startScheduler();
});