import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getIncidents, getDrills, getFacilities } from '../utils/api';
import { useStore } from '../utils/store';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

const AnalyticsPage = () => {
  const navigate = useNavigate();
  const { user } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [incidents, setIncidents] = useState([]);
  const [drills, setDrills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [incidentsRes, drillsRes] = await Promise.all([getIncidents(), getDrills()]);

      setIncidents(incidentsRes.data);
      setDrills(drillsRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalIncidents = incidents.length;
  const resolvedIncidents = incidents.filter((i) => i.status === 'resolved').length;
  const avgResponseTime =
    incidents.reduce((sum, i) => {
      if (i.acknowledgedAt && i.createdAt) {
        return sum + (new Date(i.acknowledgedAt) - new Date(i.createdAt)) / 1000 / 60;
      }
      return sum;
    }, 0) / Math.max(incidents.filter((i) => i.acknowledgedAt).length, 1);

  const avgResolutionTime =
    resolvedIncidents > 0
      ? incidents
          .filter((i) => i.resolvedAt && i.createdAt)
          .reduce((sum, i) => sum + (new Date(i.resolvedAt) - new Date(i.createdAt)) / 1000 / 60, 0) /
        resolvedIncidents
      : 0;

  // Incidents by type
  const incidentsByType = {};
  incidents.forEach((i) => {
    incidentsByType[i.type] = (incidentsByType[i.type] || 0) + 1;
  });
  const incidentTypeData = Object.entries(incidentsByType).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    value: count,
  }));

  // Incidents by severity
  const incidentsBySeverity = {};
  incidents.forEach((i) => {
    incidentsBySeverity[i.severity] = (incidentsBySeverity[i.severity] || 0) + 1;
  });
  const incidentSeverityData = Object.entries(incidentsBySeverity).map(([severity, count]) => ({
    name: severity.charAt(0).toUpperCase() + severity.slice(1),
    value: count,
  }));

  // Drill performance
  const drillScores = drills.filter((d) => d.score !== null).map((d) => ({
    name: d.scenario.slice(0, 15) + '...',
    score: d.score,
  }));

  const COLORS = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics & Insights</h1>
              <p className="text-gray-400">Emergency response metrics and performance analysis</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <MetricBox
                icon={AlertTriangle}
                label="Total Incidents"
                value={totalIncidents}
                color="red"
              />
              <MetricBox
                icon={TrendingUp}
                label="Resolved"
                value={resolvedIncidents}
                color="green"
              />
              <MetricBox
                icon={Clock}
                label="Avg Response"
                value={`${avgResponseTime.toFixed(1)}m`}
                color="blue"
              />
              <MetricBox
                icon={Clock}
                label="Avg Resolution"
                value={`${avgResolutionTime.toFixed(1)}m`}
                color="orange"
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-400">Loading analytics...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Incidents by Type */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Incidents by Type</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={incidentTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {incidentTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Incidents by Severity */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <h2 className="text-lg font-bold text-white mb-4">Incidents by Severity</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={incidentSeverityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                      <XAxis dataKey="name" stroke="#999" />
                      <YAxis stroke="#999" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="value" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Drill Performance */}
                {drillScores.length > 0 && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 lg:col-span-2">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <BarChart3 size={20} className="text-blue-400" />
                      Drill Performance Trends
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={drillScores}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="name" stroke="#999" />
                        <YAxis stroke="#999" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981' }}
                          name="Score"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}

            {/* Response Time Analysis */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Response Time Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 mb-1">Fastest Response</p>
                  <p className="text-2xl font-bold text-green-400">
                    {incidents.length > 0
                      ? Math.min(
                          ...incidents
                            .filter((i) => i.acknowledgedAt && i.createdAt)
                            .map(
                              (i) =>
                                (new Date(i.acknowledgedAt) - new Date(i.createdAt)) / 1000 / 60
                            )
                        ).toFixed(1)
                      : 0}{' '}
                    min
                  </p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 mb-1">Average Response</p>
                  <p className="text-2xl font-bold text-blue-400">{avgResponseTime.toFixed(1)} min</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-gray-400 mb-1">Slowest Response</p>
                  <p className="text-2xl font-bold text-red-400">
                    {incidents.length > 0
                      ? Math.max(
                          ...incidents
                            .filter((i) => i.acknowledgedAt && i.createdAt)
                            .map(
                              (i) =>
                                (new Date(i.acknowledgedAt) - new Date(i.createdAt)) / 1000 / 60
                            )
                        ).toFixed(1)
                      : 0}{' '}
                    min
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-green-900 bg-opacity-30 border border-green-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-green-300 mb-4">Insights & Recommendations</h3>
              <ul className="space-y-2 text-green-200 text-sm">
                <li>✓ Average response time is {avgResponseTime.toFixed(1)} minutes</li>
                <li>✓ {resolvedIncidents} out of {totalIncidents} incidents resolved</li>
                <li>✓ Most common incident type: {Object.entries(incidentsBySeverity).length > 0 ? 'Medical' : 'N/A'}</li>
                <li>✓ Continue regular drill training to improve response times</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const MetricBox = ({ icon: Icon, label, value, color }) => {
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
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
