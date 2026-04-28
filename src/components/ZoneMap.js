import React from 'react';

const ZoneMap = ({ zones, incident, route, assets, width = 800, height = 600 }) => {
  const getZoneColor = (zone) => {
    if (incident && zone._id === incident.zoneId?.toString?.()) {
      return 'fill-red-600';
    }
    if (zone.blocked) {
      return 'fill-gray-600';
    }
    if (route && route.path.some(z => z._id === zone._id)) {
      return 'fill-green-500';
    }
    if (zone.type === 'exit') {
      return 'fill-green-700';
    }
    return `fill-gray-700 opacity-${Math.max(30, 100 - zone.occupancy * 0.5)}`;
  };

  const getRiskOpacity = (zone) => {
    if (!zone.riskScore) return 0.1;
    return Math.min(zone.riskScore / 100, 0.8);
  };

  return (
    <svg width={width} height={height} className="border border-gray-700 rounded-lg bg-gray-950">
      {/* Grid background */}
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" />
        </pattern>
        {/* Risk heatmap */}
        <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#16a34a" stopOpacity="0.3" />
          <stop offset="50%" stopColor="#eab308" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#dc2626" stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={width} height={height} fill="none" />
      <rect width={width} height={height} fill="url(#grid)" />

      {/* Risk heatmap overlay */}
      {zones.map((zone) => (
        <rect
          key={`heatmap-${zone._id}`}
          x={zone.x}
          y={zone.y}
          width={zone.width}
          height={zone.height}
          fill="url(#riskGradient)"
          opacity={getRiskOpacity(zone)}
        />
      ))}

      {/* Zones */}
      {zones.map((zone) => (
        <g key={zone._id}>
          <rect
            x={zone.x}
            y={zone.y}
            width={zone.width}
            height={zone.height}
            className={getZoneColor(zone)}
            stroke="#666"
            strokeWidth="2"
            opacity="0.7"
          />
          <text
            x={zone.x + zone.width / 2}
            y={zone.y + zone.height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-xs fill-white pointer-events-none"
            fontSize="12"
          >
            {zone.name}
          </text>
          {zone.occupancy > 0 && (
            <text
              x={zone.x + zone.width / 2}
              y={zone.y + zone.height / 2 + 15}
              textAnchor="middle"
              className="text-xs fill-yellow-300 pointer-events-none"
              fontSize="10"
            >
              👥 {zone.occupancy}
            </text>
          )}
        </g>
      ))}

      {/* Assets */}
      {assets &&
        assets.map((asset) => (
          <g key={asset._id}>
            <circle cx={asset.x} cy={asset.y} r="8" fill="#3b82f6" opacity="0.8" />
            <text
              x={asset.x}
              y={asset.y - 12}
              textAnchor="middle"
              className="text-xs fill-blue-300 pointer-events-none"
              fontSize="10"
            >
              {asset.type}
            </text>
          </g>
        ))}

      {/* Route path */}
      {route &&
        route.path &&
        route.path.map((zone, idx) => {
          if (idx === 0) return null;
          const fromZone = route.path[idx - 1];
          return (
            <line
              key={`route-${idx}`}
              x1={fromZone.x + fromZone.width / 2}
              y1={fromZone.y + fromZone.height / 2}
              x2={zone.x + zone.width / 2}
              y2={zone.y + zone.height / 2}
              stroke="#10b981"
              strokeWidth="3"
              opacity="0.8"
              markerEnd="url(#arrowhead)"
            />
          );
        })}

      {/* Arrow marker */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon points="0 0, 10 3, 0 6" fill="#10b981" />
        </marker>
      </defs>
    </svg>
  );
};

export default ZoneMap;
