import React from 'react';

export const SeverityBadge = ({ severity }) => {
  const colors = {
    critical: 'bg-red-900 text-red-200',
    high: 'bg-orange-900 text-orange-200',
    medium: 'bg-yellow-900 text-yellow-200',
    low: 'bg-green-900 text-green-200',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        colors[severity] || colors.low
      }`}
    >
      {severity.toUpperCase()}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const colors = {
    new: 'bg-blue-900 text-blue-200',
    acknowledged: 'bg-yellow-900 text-yellow-200',
    'in-progress': 'bg-purple-900 text-purple-200',
    resolved: 'bg-green-900 text-green-200',
    assigned: 'bg-blue-900 text-blue-200',
    accepted: 'bg-cyan-900 text-cyan-200',
    'en-route': 'bg-orange-900 text-orange-200',
    arrived: 'bg-purple-900 text-purple-200',
    available: 'bg-green-900 text-green-200',
    'on-task': 'bg-orange-900 text-orange-200',
    'on-break': 'bg-gray-900 text-gray-200',
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        colors[status] || colors.new
      }`}
    >
      {status.toUpperCase().replace(/_/g, ' ')}
    </span>
  );
};

export default { SeverityBadge, StatusBadge };
