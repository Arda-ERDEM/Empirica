'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DomainScore, CognitiveDomain } from '@/types/cognitive';
import { Target, RefreshCw, Brain, Zap, Compass, ArrowUpRight, CheckCircle2, Sparkles } from 'lucide-react';

interface DomainDetailCardsProps {
  domains: Record<CognitiveDomain, DomainScore>;
  selectedDomain: CognitiveDomain | 'all';
  onSelectDomain: (domain: CognitiveDomain | 'all') => void;
}

const iconMap = {
  Target: Target,
  RefreshCw: RefreshCw,
  Brain: Brain,
  Zap: Zap,
  Compass: Compass,
};

export const DomainDetailCards: React.FC<DomainDetailCardsProps> = ({
  domains,
  selectedDomain,
  onSelectDomain,
}) => {
  const domainList = Object.values(domains);

  return (
    <div className="space-y-4">
      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => onSelectDomain('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
            selectedDomain === 'all'
              ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 ring-1 ring-sky-400'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Tüm Bilişsel Alanlar (5)
        </button>

        {domainList.map((d) => (
          <button
            key={`filter-${d.domain}`}
            onClick={() => onSelectDomain(d.domain)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
              selectedDomain === d.domain
                ? 'bg-slate-700 text-white ring-1 shadow-md'
                : 'bg-slate-800/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70'
            }`}
            style={{
              borderColor: selectedDomain === d.domain ? d.color : 'transparent',
              color: selectedDomain === d.domain ? '#fff' : undefined,
            }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
            {d.title.split('&')[0].trim()}
          </button>
        ))}
      </div>

      {/* Grid of Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {domainList
          .filter((d) => selectedDomain === 'all' || selectedDomain === d.domain)
          .map((d, index) => {
            const IconComponent = iconMap[d.iconName as keyof typeof iconMap] || Brain;
            const diffWithBenchmark = d.score - d.benchmark;

            return (
              <motion.div
                key={d.domain}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                onClick={() => onSelectDomain(d.domain === selectedDomain ? 'all' : d.domain)}
                className={`glass-panel glass-card-interactive rounded-2xl p-5 cursor-pointer relative overflow-hidden group ${
                  selectedDomain === d.domain ? 'ring-2' : ''
                }`}
                style={{
                  borderColor: selectedDomain === d.domain ? d.color : 'rgba(255, 255, 255, 0.08)',
                }}
              >
                {/* Top Corner Ambient Glow */}
                <div
                  className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                  style={{ backgroundColor: d.color }}
                />

                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: d.accentBg, color: d.color }}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                        {d.title}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-400">
                        {d.levelTitle}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-black tracking-tight" style={{ color: d.color }}>
                      {d.score}
                      <span className="text-xs text-slate-500 font-normal">/100</span>
                    </div>
                    <div className="flex items-center justify-end text-[10px] text-emerald-400 font-bold">
                      <ArrowUpRight className="w-3 h-3" />
                      +{d.trend}% (7g)
                    </div>
                  </div>
                </div>

                {/* Short Scientific Definition */}
                <p className="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-2">
                  {d.shortDesc}
                </p>

                {/* Benchmark Bar */}
                <div className="space-y-1.5 mb-4 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between text-[11px] font-medium">
                    <span className="text-slate-400">Akran Karşılaştırması</span>
                    <span className="text-sky-400 font-bold">
                      {diffWithBenchmark > 0 ? `+${diffWithBenchmark} Puan İleride` : `${diffWithBenchmark} Puan`}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${d.score}%`,
                        backgroundColor: d.color,
                        boxShadow: `0 0 8px ${d.color}`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500">
                    <span>Ortalama: {d.benchmark}</span>
                    <span>Hedef: 95</span>
                  </div>
                </div>

                {/* FAR TRANSFER (Uzak Aktarım) Highlight Box */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Uzak Aktarım (Gerçek Hayat Etkisi):</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug bg-amber-500/5 border border-amber-500/15 p-2 rounded-lg">
                    {d.farTransferBenefit}
                  </p>
                </div>

                {/* Practical Scenario */}
                <div className="mt-2.5 flex items-start gap-1.5 text-[10px] text-slate-400">
                  <CheckCircle2 className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                  <span className="italic">{d.practicalApplication}</span>
                </div>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
};
