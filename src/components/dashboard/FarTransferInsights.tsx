'use client';

import React from 'react';
import { FarTransferMetric } from '@/types/cognitive';
import { Sparkles, ArrowRight, BookOpen, CheckCircle, ShieldAlert } from 'lucide-react';

interface FarTransferInsightsProps {
  insights: FarTransferMetric[];
}

export const FarTransferInsights: React.FC<FarTransferInsightsProps> = ({ insights }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-wide">
              Uzak Aktarım (Far Transfer) & Pratik Hayat Etkisi
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-[10px] font-bold text-emerald-300">
              ELEVATE & NÖROBİLİM STANDARDI
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Egzersizlerin yalnızca oyunda değil; iş, karar alma, iletişim ve günlük stres yönetimindeki somut getirileri.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                  {item.domain === 'flexibility' && 'Bilişsel Esneklik'}
                  {item.domain === 'attention' && 'Seçici Dikkat'}
                  {item.domain === 'speed' && 'İşlemleme Hızı'}
                </span>
                <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  +{item.gainPercentage}% İlerleme
                </span>
              </div>

              {/* Title */}
              <h4 className="text-sm font-bold text-white mb-2">
                {item.skillName}
              </h4>

              {/* Real World Impact */}
              <p className="text-xs text-slate-300 leading-relaxed mb-3">
                {item.realWorldImpact}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-800/70">
              <div className="text-[10px] text-slate-400 flex items-start gap-1.5">
                <span className="font-semibold text-slate-300 shrink-0">Popülasyon Kıyası:</span>
                <span>{item.benchmarkContext}</span>
              </div>
              <div className="text-[9px] text-slate-500 flex items-center gap-1 italic">
                <BookOpen className="w-3 h-3 text-slate-600" />
                <span>{item.evidenceBasedNote}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
