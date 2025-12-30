const services = new Map();
let serviceIdCounter = 1;

function addService(service) {
  services.set(service.id, service);
}

function getAllServices() {
  return Array.from(services.values());
}

function getServiceById(id) {
  return services.get(id);
}

function generateServiceId() {
  return serviceIdCounter++;
}

module.exports = {
  addService,
  getAllServices,
  getServiceById,
  generateServiceId
};