import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { StatusBadge } from '../components/Badges';
import { getUserById, updateUserStatus, getResponderRoute } from '../utils/api';
import { useStore } from '../utils/store';
import {
  Navigation,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  Phone,
  Activity,
} from 'lucide-react';

const ResponderPage = () => {
  const navigate = useNavigate();
  const { user } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [responderData, setResponderData] = useState(null);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      fetchResponderData();
      const interval = setInterval(fetchResponderData, 5000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchResponderData = async () => {
    try {
      const response = await getUserById(user._id);
      setResponderData(response.data.user);

      const assignments = response.data.assignments;
      if (assignments.length > 0) {
        const active = assignments[0];
        setCurrentAssignment(active);

        if (active.incidentId?.zoneId && active.incidentId?.floorId) {
          try {
            const routeRes = await getResponderRoute({
              fromZoneId: user.currentZoneId || user.location?._id,
              toZoneId: active.incidentId.zoneId,
              floorId: active.incidentId.floorId,
            });
            setRoute(routeRes.data);
          } catch (err) {
            console.log('Route calculation failed');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching responder data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateUserStatus(user._id, newStatus);
      fetchResponderData();
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
            <p className="text-gray-400">Loading...</p>
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
          <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
            {/* Responder Status */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h1 className="text-3xl font-bold text-white mb-4">{responderData?.name}</h1>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">Role</p>
                  <p className="text-white font-medium capitalize mt-1">{responderData?.role}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={responderData?.status} />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Location</p>
                  <p className="text-white font-medium mt-1">{responderData?.currentZoneId || 'Base'}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Phone</p>
                  <p className="text-white font-medium mt-1">{responderData?.phone}</p>
                </div>
              </div>
            </div>

            {/* Current Assignment */}
            {currentAssignment ? (
              <div className="bg-red-900 bg-opacity-30 rounded-lg border border-red-700 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-red-300 mb-2">Active Assignment</h2>
                    <p className="text-red-200">
                      Incident ID: {currentAssignment.incidentId?._id?.slice(0, 8)}
                    </p>
                  </div>
                  <div className="animate-pulse">
                    <AlertCircle size={32} className="text-red-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-red-200 text-sm">Destination</p>
                    <p className="text-white font-bold mt-2 flex items-center gap-2">
                      <MapPin size={20} className="text-red-400" />
                      {currentAssignment.incidentId?.zoneId?.name || 'Unknown Zone'}
                    </p>
                  </div>

                  <div>
                    <p className="text-red-200 text-sm">ETA</p>
                    <p className="text-white font-bold mt-2 flex items-center gap-2">
                      <Clock size={20} className="text-orange-400" />
                      {currentAssignment.etaMinutes} minutes
                    </p>
                  </div>
                </div>

                {/* Route Info */}
                {route && (
                  <div className="p-4 bg-gray-900 rounded-lg border border-gray-700 mb-6">
                    <div className="flex items-start gap-3">
                      <Navigation size={20} className="text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-green-300 font-medium">Route: {route.path?.length || 0} zones</p>
                        <p className="text-gray-400 text-sm mt-1">
                          Distance: {Math.round(route.distance)} units |{' '}
                          Estimated: {Math.round(route.estimatedTimeSeconds / 60)} minutes
                        </p>
                        <div className="mt-3 space-y-2">
                          {route.path?.slice(0, 5).map((zone, idx) => (
                            <div key={idx} className="text-sm text-gray-300">
                              {idx + 1}. {zone.name}
                            </div>
                          ))}
                          {route.path?.length > 5 && (
                            <div className="text-sm text-gray-500">
                              + {route.path.length - 5} more zones...
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleStatusChange('on-task')}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      responderData?.status === 'on-task'
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    En Route
                  </button>
                  <button
                    onClick={() => handleStatusChange('available')}
                    className={`px-4 py-3 rounded-lg font-medium transition ${
                      responderData?.status === 'available'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Arrived
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-green-900 bg-opacity-20 rounded-lg border border-green-700 p-6 text-center">
                <Activity size={32} className="text-green-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-300">No Active Assignment</h3>
                <p className="text-green-200 mt-2">You are currently available for dispatch</p>
              </div>
            )}

            {/* Status Control */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Status</h3>
              <div className="grid grid-cols-3 gap-3">
                {['available', 'on-task', 'on-break'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className={`px-4 py-3 rounded-lg font-medium transition capitalize ${
                      responderData?.status === status
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {status.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Phone size={20} className="text-red-400" />
                Emergency Contacts
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm">Dispatch Center</p>
                  <p className="text-white font-medium">+1-555-0100</p>
                </div>
                <div className="p-3 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 text-sm">Medical Support</p>
                  <p className="text-white font-medium">+1-555-0102</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResponderPage;
