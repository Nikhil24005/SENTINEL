import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import IncidentCard from '../components/IncidentCard';
import { useStore } from '../utils/store';
import {
  getIncidents,
  getFacilities,
  getSimulationPresets,
  simulateIncident,
} from '../utils/api';
import {
  AlertTriangle,
  Zap,
  BarChart3,
  Users,
  Activity,
  Clock,
  TrendingUp,
} from 'lucide-react';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, incidents, setIncidents, facilities, setFacilities, selectedFacility, setSelectedFacility } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [presets, setPresets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incidentsRes, facilitiesRes, presetsRes] = await Promise.all([
        getIncidents(),
        getFacilities(),
        getSimulationPresets(),
      ]);

      setIncidents(incidentsRes.data);
      setFacilities(facilitiesRes.data);
      setPresets(presetsRes.data);

      if (!selectedFacility && facilitiesRes.data.length > 0) {
        setSelectedFacility(facilitiesRes.data[0]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (preset) => {
    try {
      setSimulating(true);
      const facilityZoneMap = {
        hotel: { facilityIdx: 0, zoneName: 'Lobby' },
        mall: { facilityIdx: 1, zoneName: 'Food Court' },
        stadium: { facilityIdx: 2, zoneName: 'South Gate' },
      };

      const map = facilityZoneMap[preset.facility];
      if (!map) return;

      const facility = facilities[map.facilityIdx];
      if (!facility) return;

      // Find zone by name (simplified - in real app would use proper mapping)
      const matchingZones = incidents.filter(i => i.facilityId === facility._id);
      const zoneId = matchingZones.length > 0 ? matchingZones[0].zoneId : facility._id;

      await simulateIncident({
        facilityId: facility._id,
        zoneId: zoneId,
        incidentType: preset.type,
      });

      fetchData();
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setSimulating(false);
    }
  };

  const activeIncidents = incidents.filter(i => i.status !== 'resolved');
  const criticalIncidents = activeIncidents.filter(i => i.severity === 'critical');

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Live Incident Command</h1>
              <p className="text-gray-400">
                {selectedFacility ? `Monitoring ${selectedFacility.name}` : 'Select a facility'}
              </p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricCard
                icon={AlertTriangle}
                label="Critical"
                value={criticalIncidents.length}
                color="red"
              />
              <MetricCard
                icon={Activity}
                label="Active"
                value={activeIncidents.length}
                color="orange"
              />
              <MetricCard
                icon={Clock}
                label="Avg Response"
                value="2m 14s"
                color="blue"
              />
              <MetricCard
                icon={Users}
                label="Available"
                value="12"
                color="green"
              />
            </div>

            {/* Facility Selector */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">
                Select Facility
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {facilities.map((facility) => (
                  <button
                    key={facility._id}
                    onClick={() => setSelectedFacility(facility)}
                    className={`p-4 rounded-lg border transition ${
                      selectedFacility?._id === facility._id
                        ? 'bg-red-900 border-red-600'
                        : 'bg-gray-700 border-gray-600 hover:border-red-600'
                    }`}
                  >
                    <p className="font-medium text-white">{facility.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{facility.type}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Panel */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Zap size={20} className="text-yellow-500" />
                <h2 className="text-lg font-semibold text-white">AI-Assisted Risk Engine</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Run training simulations or test incident scenarios
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleSimulate(preset)}
                    disabled={simulating}
                    className="p-4 rounded-lg bg-gray-700 border border-gray-600 hover:border-yellow-600 hover:bg-gray-600 transition disabled:opacity-50 text-left"
                  >
                    <p className="font-medium text-white text-sm">{preset.name}</p>
                    <p className="text-xs text-gray-400 mt-1">{preset.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Incidents */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Active Incidents</h2>
                {activeIncidents.length > 0 && (
                  <span className="px-3 py-1 bg-red-900 text-red-200 rounded-full text-sm font-semibold">
                    {activeIncidents.length} Active
                  </span>
                )}
              </div>

              {activeIncidents.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No active incidents</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeIncidents.slice(0, 6).map((incident) => (
                    <IncidentCard key={incident._id} incident={incident} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    red: 'bg-red-900 text-red-200',
    orange: 'bg-orange-900 text-orange-200',
    blue: 'bg-blue-900 text-blue-200',
    green: 'bg-green-900 text-green-200',
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
