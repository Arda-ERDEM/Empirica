'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DomainScore } from '@/types/cognitive';

interface RadarChartProps {
  domains: Record<string, DomainScore>;
  onSelectDomain?: (domainKey: string) => void;
}

export const CognitiveRadarChart: React.FC<RadarChartProps> = ({ domains, onSelectDomain }) => {
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  const domainList = Object.values(domains);
  const totalAxes = domainList.length;
  const size = 380;
  const center = size / 2;
  const radius = 135;

  // Level grid circles (20%, 40%, 60%, 80%, 100%)
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (value: number, index: number, maxVal = 100) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2;
    const r = (value / maxVal) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, angle };
  };

  // Build polygon points for user scores
  const userPoints = domainList.map((d, i) => {
    const { x, y } = getCoordinates(d.score, i);
    return `${x},${y}`;
  }).join(' ');

  // Build polygon points for benchmark
  const benchmarkPoints = domainList.map((d, i) => {
    const { x, y } = getCoordinates(d.benchmark, i);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 via-purple-500/10 to-transparent blur-2xl pointer-events-none rounded-3xl" />

      <svg width={size} height={size} className="overflow-visible select-none">
        <defs>
          <linearGradient id="userScoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.65" />
            <stop offset="50%" stopColor="#818cf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.6" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Concentric Polygons / Grid Web */}
        {levels.map((level, lvlIdx) => {
          const gridPoints = domainList.map((_, i) => {
            const { x, y } = getCoordinates(level * 100, i);
            return `${x},${y}`;
          }).join(' ');

          return (
            <g key={`level-${lvlIdx}`}>
              <polygon
                points={gridPoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth={lvlIdx === levels.length - 1 ? "1.5" : "1"}
                strokeDasharray={lvlIdx === levels.length - 1 ? undefined : "3 3"}
              />
              {/* Score percentage hint on top axis */}
              <text
                x={center + 6}
                y={center - level * radius + 10}
                fill="rgba(148, 163, 184, 0.4)"
                fontSize="9"
                fontWeight="500"
              >
                {Math.round(level * 100)}
              </text>
            </g>
          );
        })}

        {/* Axis Spokes from Center to Outer Radius */}
        {domainList.map((d, i) => {
          const { x, y } = getCoordinates(100, i);
          return (
            <line
              key={`spoke-${i}`}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeWidth="1"
            />
          );
        })}

        {/* Benchmark Polygon (Peer Average) */}
        <polygon
          points={benchmarkPoints}
          fill="rgba(245, 158, 11, 0.06)"
          stroke="#f59e0b"
          strokeWidth="1.8"
          strokeDasharray="4 4"
          opacity="0.8"
        />

        {/* User Actual Score Polygon with Animation */}
        <motion.polygon
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          points={userPoints}
          fill="url(#userScoreGradient)"
          stroke="#38bdf8"
          strokeWidth="2.5"
          filter="url(#glow)"
        />

        {/* Vertex Nodes (Interactive Points) */}
        {domainList.map((d, i) => {
          const userCoord = getCoordinates(d.score, i);
          const isHovered = hoveredDomain === d.domain;

          return (
            <g
              key={`node-${d.domain}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredDomain(d.domain)}
              onMouseLeave={() => setHoveredDomain(null)}
              onClick={() => onSelectDomain?.(d.domain)}
            >
              {/* Outer pulsing ring on hover */}
              {isHovered && (
                <circle
                  cx={userCoord.x}
                  cy={userCoord.y}
                  r="12"
                  fill="none"
                  stroke={d.color}
                  strokeWidth="2"
                  className="animate-ping opacity-75"
                />
              )}
              {/* Main Node */}
              <circle
                cx={userCoord.x}
                cy={userCoord.y}
                r={isHovered ? "7" : "5"}
                fill="#070913"
                stroke={d.color}
                strokeWidth="2.5"
                style={{ transition: 'all 0.2s ease' }}
              />
            </g>
          );
        })}

        {/* Outer Domain Labels */}
        {domainList.map((d, i) => {
          const { angle } = getCoordinates(100, i);
          const labelDist = radius + 38;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);
          const isHovered = hoveredDomain === d.domain;

          return (
            <g
              key={`label-${d.domain}`}
              className="cursor-pointer transition-transform"
              onMouseEnter={() => setHoveredDomain(d.domain)}
              onMouseLeave={() => setHoveredDomain(null)}
              onClick={() => onSelectDomain?.(d.domain)}
            >
              <text
                x={lx}
                y={ly - 4}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={isHovered ? '#38bdf8' : '#e2e8f0'}
                fontSize="11"
                fontWeight={isHovered ? "700" : "600"}
                className="transition-colors duration-200"
              >
                {d.title.split('&')[0].trim()}
              </text>
              <text
                x={lx}
                y={ly + 10}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={d.color}
                fontSize="10"
                fontWeight="700"
              >
                {d.score} <tspan fill="#64748b" fontSize="8 font-normal">/ 100</tspan>
              </text>
            </g>
          );
        })}
      </svg>

      {/* Legend & Insight Preview */}
      <div className="flex items-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-sky-400 to-purple-500 shadow-sm shadow-sky-500/50" />
          <span className="text-slate-300 font-medium">Bilişsel Profiliniz</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-0.5 border-t border-dashed border-amber-400" />
          <span className="text-slate-400 font-medium">Akran Ortalaması</span>
        </div>
      </div>

      {/* Hovered Domain Instant Micro-Detail */}
      {hoveredDomain && domains[hoveredDomain] && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-2 shadow-lg"
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: domains[hoveredDomain].color }} />
          <span className="font-semibold text-white">{domains[hoveredDomain].title}:</span>
          <span>{domains[hoveredDomain].levelTitle}</span>
          <span className="text-sky-400 font-bold ml-1">+{domains[hoveredDomain].trend}%</span>
        </motion.div>
      )}
    </div>
  );
};
