import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Incidents
export const getIncidents = () => api.get('/incidents');
export const getIncidentById = (id) => api.get(`/incidents/${id}`);
export const getActiveIncidents = () => api.get('/incidents/status/active');
export const createIncident = (data) => api.post('/incidents', data);
export const acknowledgeIncident = (id) => api.patch(`/incidents/${id}/acknowledge`);
export const updateIncidentStatus = (id, status) =>
  api.patch(`/incidents/${id}/status`, { status });

// Facilities
export const getFacilities = () => api.get('/facilities');
export const getFacilityById = (id) => api.get(`/facilities/${id}`);
export const getFacilityOverview = (id) => api.get(`/facilities/${id}/overview`);
export const getFacilityMap = (facilityId, floorId) =>
  api.get(`/facilities/${facilityId}/floors/${floorId}/map`);
export const updateFacilityOccupancy = (id, occupancy) =>
  api.patch(`/facilities/${id}/occupancy`, { currentOccupancy: occupancy });

// Users
export const getUsers = () => api.get('/users');
export const getUserById = (id) => api.get(`/users/${id}`);
export const getUsersByRole = (role) => api.get(`/users/role/${role}`);
export const loginUser = (email) => api.post('/users/login', { email });
export const updateUserStatus = (id, status) =>
  api.patch(`/users/${id}/status`, { status });
export const updateUserLocation = (id, location) =>
  api.patch(`/users/${id}/location`, location);

// Simulation
export const getSimulationPresets = () => api.get('/simulation/presets');
export const simulateIncident = (data) => api.post('/simulation/simulate', data);
export const getDrills = () => api.get('/simulation/drills');
export const getDrillById = (id) => api.get(`/simulation/drills/${id}`);
export const createDrill = (data) => api.post('/simulation/drills', data);
export const completeDrill = (id) => api.post(`/simulation/drills/${id}/complete`);
export const addDrillEvent = (id, data) => api.post(`/simulation/drills/${id}/events`, data);

// Routing
export const getEvacuationRoute = (data) => api.post('/routing/evacuation', data);
export const getResponderRoute = (data) => api.post('/routing/responder', data);
export const getNearestAED = (data) => api.post('/routing/nearest-aed', data);

// Help
export const submitHelpRequest = (zoneId, data) =>
  api.post(`/help/${zoneId}`, data);

export default api;
