import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitHelpRequest, getFacilities } from '../utils/api';
import { AlertTriangle, Phone, Send, CheckCircle } from 'lucide-react';

const HelpPage = () => {
  const { zoneId } = useParams();
  const navigate = useNavigate();

  const [emergencyType, setEmergencyType] = useState('medical');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [facilities, setFacilities] = useState([]);

  const emergencyOptions = [
    { value: 'medical', label: 'Medical Emergency', icon: '🏥' },
    { value: 'fire', label: 'Fire', icon: '🔥' },
    { value: 'panic_button', label: 'Security Help', icon: '🚨' },
    { value: 'suspicious_activity', label: 'Suspicious Activity', icon: '👁️' },
    { value: 'other', label: 'Other', icon: '❓' },
  ];

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      const response = await getFacilities();
      setFacilities(response.data);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emergencyType) {
      setError('Please select an emergency type');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Use first facility as default for demo
      const facility = facilities.length > 0 ? facilities[0] : null;

      if (!facility) {
        setError('No facility available');
        return;
      }

      await submitHelpRequest(zoneId || 'zone-1', {
        emergencyType,
        message,
        facilityId: facility._id,
        floorId: facility._id, // Simplified
      });

      setSubmitted(true);
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError('Failed to submit help request. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Help Received</h1>
          <p className="text-gray-300 mb-2">Your emergency request has been submitted.</p>
          <p className="text-green-400 font-semibold">Responders are on their way!</p>
          <p className="text-gray-500 text-sm mt-4">Redirecting you in 3 seconds...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <AlertTriangle size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Emergency Help</h1>
          <p className="text-gray-400">Zone: {zoneId?.replace('zone-', '').toUpperCase() || 'Main'}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-900 border border-red-600 rounded-lg">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Emergency Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              What's the emergency?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {emergencyOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setEmergencyType(option.value)}
                  className={`p-3 rounded-lg border transition text-center ${
                    emergencyType === option.value
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:border-red-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Additional Details (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the situation..."
              rows="4"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-600"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition flex items-center justify-center gap-2 text-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={20} />
                Call for Help
              </>
            )}
          </button>

          {/* Emergency Info */}
          <div className="bg-yellow-900 bg-opacity-30 border border-yellow-700 rounded-lg p-3 mt-4">
            <p className="text-yellow-200 text-xs text-center">
              <strong>Response Team Notified</strong>
              <br />
              Emergency responders and security staff will be notified immediately
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Phone size={14} />
            <span>For immediate life-threatening emergencies, also call emergency services</span>
          </div>
          <p>SENTINEL Emergency Response System</p>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
