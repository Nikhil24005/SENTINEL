import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../utils/api';
import { useStore } from '../utils/store';
import { LogIn, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [selectedEmail, setSelectedEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const demoUsers = [
    { email: 'admin@sentinel.demo', name: 'Admin Control', role: 'admin' },
    { email: 'security@sentinel.demo', name: 'Security Chief', role: 'security' },
    { email: 'medic@sentinel.demo', name: 'Dr. Sarah Medical', role: 'medic' },
    { email: 'firewarden@sentinel.demo', name: 'Fire Chief', role: 'firewarden' },
  ];

  const handleLogin = async (email) => {
    try {
      setLoading(true);
      setError('');
      const response = await loginUser(email);
      setUser(response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <AlertCircle size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">SENTINEL</h1>
          <p className="text-gray-400">Smart Emergency Response System</p>
          <p className="text-sm text-gray-500 mt-2">Every second saves lives</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-600 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Demo Users */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">Select Demo Account</h2>

          <div className="space-y-3">
            {demoUsers.map((demoUser) => (
              <button
                key={demoUser.email}
                onClick={() => handleLogin(demoUser.email)}
                disabled={loading}
                className="w-full text-left p-4 rounded-lg border border-gray-700 hover:border-red-600 hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">{demoUser.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{demoUser.role}</p>
                  </div>
                  <LogIn size={18} className="text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-900 bg-opacity-30 border border-blue-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-200">
            <strong>Demo Mode:</strong> All accounts are pre-configured. Select any role to explore SENTINEL.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>SENTINEL Emergency Response v1.0</p>
          <p>© 2024 Smart Emergency Systems</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
