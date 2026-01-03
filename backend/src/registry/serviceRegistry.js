const services = new Map();

function addService(service) {
  services.set(service.id, service);
}

function getAllServices() {
  return Array.from(services.values());
}

function getServiceById(id) {
  return services.get(id);
}

module.exports = {
  addService,
  getAllServices,
  getServiceById
};