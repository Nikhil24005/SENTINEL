import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import ZoneMap from '../components/ZoneMap';
import { SeverityBadge, StatusBadge } from '../components/Badges';
import { getIncidentById, updateIncidentStatus, getFacilityMap, getEvacuationRoute } from '../utils/api';
import { useStore } from '../utils/store';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  AlertTriangle,
  Route as RouteIcon,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const IncidentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [incident, setIncident] = useState(null);
  const [events, setEvents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    fetchIncidentData();
    const interval = setInterval(fetchIncidentData, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const fetchIncidentData = async () => {
    try {
      const response = await getIncidentById(id);
      const data = response.data;

      setIncident(data);
      setEvents(data.events || []);
      setAssignments(data.assignments || []);

      if (data.floorId && data.facilityId) {
        const mapRes = await getFacilityMap(data.facilityId, data.floorId);
        setMapData(mapRes.data);

        if (data.zoneId && mapRes.data.zones) {
          try {
            const routeRes = await getEvacuationRoute({
              fromZoneId: data.zoneId,
              floorId: data.floorId,
            });
            setRoute(routeRes.data);
          } catch (err) {
            console.log('Route not available');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching incident:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await updateIncidentStatus(id, newStatus);
      fetchIncidentData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-950">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-400">Loading incident...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="flex h-screen bg-gray-950">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-400">Incident not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </button>

            {/* Incident Header */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-white capitalize">
                    {incident.type.replace(/_/g, ' ')} Emergency
                  </h1>
                  <p className="text-gray-400 mt-2">ID: {incident.id}</p>
                </div>
                <div className="flex gap-2">
                  <SeverityBadge severity={incident.severity} />
                  <StatusBadge status={incident.status} />
                </div>
              </div>

              {/* Incident Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-medium flex items-center gap-2 mt-1">
                    <MapPin size={18} className="text-red-400" />
                    {incident.zoneId?.name || 'Unknown Zone'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Reported</p>
                  <p className="text-white font-medium flex items-center gap-2 mt-1">
                    <Clock size={18} className="text-blue-400" />
                    {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Risk Score</p>
                  <p className="text-white font-medium flex items-center gap-2 mt-1">
                    <AlertTriangle size={18} className="text-orange-400" />
                    {incident.riskScore}/100
                  </p>
                </div>
              </div>

              {incident.description && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <p className="text-gray-300 text-sm">{incident.description}</p>
                </div>
              )}
            </div>

            {/* Map and Route */}
            {mapData && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <RouteIcon size={24} className="text-green-400" />
                  Recommended Safe Route
                </h2>
                <ZoneMap
                  zones={mapData.zones || []}
                  incident={incident}
                  route={route}
                  assets={mapData.assets || []}
                  width={800}
                  height={500}
                />
                {route && (
                  <div className="mt-4 p-4 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg">
                    <p className="text-green-300 text-sm">
                      <strong>Route Distance:</strong> {Math.round(route.distance)} units |{' '}
                      <strong>Estimated Time:</strong> {Math.round(route.estimatedTimeSeconds / 60)} minutes
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assignments */}
              <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Users size={20} className="text-blue-400" />
                  Assigned Responders ({assignments.length})
                </h2>

                {assignments.length === 0 ? (
                  <p className="text-gray-400">No responders assigned</p>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((assignment) => (
                      <div key={assignment._id} className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-white">
                              {assignment.userId?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">{assignment.roleNeeded}</p>
                          </div>
                          <div className="text-right">
                            <StatusBadge status={assignment.status} />
                            <p className="text-xs text-gray-400 mt-1">ETA: {assignment.etaMinutes} min</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Actions</h2>
                <div className="space-y-3">
                  {incident.status === 'new' && (
                    <button
                      onClick={() => handleStatusUpdate('acknowledged')}
                      className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition font-medium flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={18} />
                      Acknowledge
                    </button>
                  )}
                  {incident.status === 'acknowledged' && (
                    <button
                      onClick={() => handleStatusUpdate('in-progress')}
                      className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition font-medium"
                    >
                      Dispatch Response
                    </button>
                  )}
                  {incident.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusUpdate('resolved')}
                      className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium"
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Incident Timeline</h2>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-gray-400">No timeline events</p>
                ) : (
                  events.map((event, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b border-gray-700 last:border-b-0">
                      <div className="flex-shrink-0">
                        <div className="w-3 h-3 mt-2 rounded-full bg-blue-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium capitalize">{event.type.replace(/_/g, ' ')}</p>
                        <p className="text-gray-400 text-sm">{event.message}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default IncidentPage;
