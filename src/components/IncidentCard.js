import React from 'react';
import { Link } from 'react-router-dom';
import { SeverityBadge, StatusBadge } from './Badges';
import { AlertTriangle, Clock, MapPin, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const IncidentCard = ({ incident, onClick }) => {
  const getIncidentIcon = (type) => {
    return <AlertTriangle size={20} className="text-red-400" />;
  };

  return (
    <Link
      to={`/incidents/${incident._id}`}
      onClick={onClick}
      className="block bg-gray-800 rounded-lg border border-gray-700 hover:border-red-600 hover:bg-gray-750 transition p-4 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-2 bg-red-900 rounded-lg">{getIncidentIcon(incident.type)}</div>
          <div>
            <h3 className="font-semibold text-white capitalize">
              {incident.type.replace(/_/g, ' ')}
            </h3>
            <p className="text-xs text-gray-400">ID: {incident.id?.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <SeverityBadge severity={incident.severity} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-gray-500" />
          <span>{incident.zoneId?.name || 'Unknown Zone'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-500" />
          <span>{formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true })}</span>
        </div>
        {incident.description && (
          <p className="text-gray-400 line-clamp-2">{incident.description}</p>
        )}
      </div>
    </Link>
  );
};

export default IncidentCard;
