import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { getDrills, createDrill, completeDrill } from '../utils/api';
import { useStore } from '../utils/store';
import { Zap, Play, Pause, BarChart3, FileText } from 'lucide-react';
import { format } from 'date-fns';

const DrillsPage = () => {
  const navigate = useNavigate();
  const { user, facilities, selectedFacility } = useStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [drills, setDrills] = useState([]);
  const [currentDrill, setCurrentDrill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scenarioInput, setScenarioInput] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    fetchDrills();
    const interval = setInterval(fetchDrills, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDrills = async () => {
    try {
      const response = await getDrills();
      setDrills(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching drills:', error);
      setLoading(false);
    }
  };

  const handleStartDrill = async () => {
    if (!selectedFacility || !scenarioInput) return;

    try {
      const response = await createDrill({
        facilityId: selectedFacility._id,
        scenario: scenarioInput,
      });
      setCurrentDrill(response.data);
      setScenarioInput('');
    } catch (error) {
      console.error('Error creating drill:', error);
    }
  };

  const handleCompleteDrill = async () => {
    if (!currentDrill) return;

    try {
      const response = await completeDrill(currentDrill._id);
      setCurrentDrill(null);
      fetchDrills();
    } catch (error) {
      console.error('Error completing drill:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Training & Drills</h1>
              <p className="text-gray-400">Practice emergency response procedures</p>
            </div>

            {/* Active Drill */}
            {currentDrill && (
              <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-yellow-300 flex items-center gap-2">
                      <Zap size={24} className="animate-pulse" />
                      Active Drill In Progress
                    </h2>
                    <p className="text-yellow-200 mt-2">Scenario: {currentDrill.scenario}</p>
                    <p className="text-yellow-100 text-sm mt-1">
                      Started: {format(new Date(currentDrill.startedAt), 'PPP p')}
                    </p>
                  </div>
                  <button
                    onClick={handleCompleteDrill}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                  >
                    <Pause size={18} />
                    End Drill
                  </button>
                </div>
              </div>
            )}

            {/* Start New Drill */}
            {!currentDrill && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-lg font-bold text-white mb-4">Start New Drill</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Facility
                    </label>
                    <p className="text-white font-medium">
                      {selectedFacility?.name || 'No facility selected'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Drill Scenario
                    </label>
                    <input
                      type="text"
                      value={scenarioInput}
                      onChange={(e) => setScenarioInput(e.target.value)}
                      placeholder="e.g., Multiple building fires with evacuations"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <button
                    onClick={handleStartDrill}
                    disabled={!scenarioInput || !selectedFacility}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
                  >
                    <Play size={18} />
                    Start Drill
                  </button>
                </div>
              </div>
            )}

            {/* Past Drills */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-lg font-bold text-white mb-4">Past Drills</h2>

              {loading ? (
                <p className="text-gray-400">Loading drills...</p>
              ) : drills.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No drills completed yet</p>
              ) : (
                <div className="space-y-3">
                  {drills.map((drill) => (
                    <div
                      key={drill._id}
                      className="bg-gray-700 rounded-lg border border-gray-600 p-4 hover:border-blue-600 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{drill.scenario}</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {format(new Date(drill.startedAt), 'PPP p')} -{' '}
                            {drill.endedAt ? format(new Date(drill.endedAt), 'p') : 'Ongoing'}
                          </p>
                          {drill.report && (
                            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{drill.report}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-2">
                            <BarChart3 size={18} className="text-blue-400" />
                            <span className="text-xl font-bold text-white">{drill.score}</span>
                            <span className="text-gray-400">/100</span>
                          </div>
                          <button className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition flex items-center gap-1">
                            <FileText size={14} />
                            Report
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Drill Guidelines */}
            <div className="bg-blue-900 bg-opacity-30 border border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-300 mb-4">Drill Best Practices</h3>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li>• Run drills at least monthly to maintain team readiness</li>
                <li>• Include all responder roles in the scenario</li>
                <li>• Conduct after-action reviews to identify improvements</li>
                <li>• Document timeline and response metrics for analysis</li>
                <li>• Use realistic scenarios based on facility risks</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DrillsPage;
