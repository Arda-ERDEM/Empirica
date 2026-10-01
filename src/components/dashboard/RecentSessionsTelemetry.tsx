'use client';

import React from 'react';
import { GameSessionResult } from '@/types/cognitive';
import { Clock, Zap, Target, AlertCircle, ArrowUpRight, BarChart3 } from 'lucide-react';

interface RecentSessionsTelemetryProps {
  sessions: GameSessionResult[];
}

export const RecentSessionsTelemetry: React.FC<RecentSessionsTelemetryProps> = ({ sessions }) => {
  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white tracking-wide">
              Bilişsel Telemetri & Seans Analitiği
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-400/30 text-[10px] font-bold text-purple-300">
              DERİN ANALİZ
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Yüzeysel puanlar yerine; reaksiyon süresi (ms), kural değişimi hataları ve nöral yorgunluk eşiği dökümü.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((s) => (
          <div
            key={s.id}
            className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 hover:border-slate-700 transition-all"
          >
            {/* Top row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 font-bold text-xs">
                  S{s.difficultyReached}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{s.gameTitle}</h4>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{s.timestamp}</span>
                    <span>•</span>
                    <span className="text-purple-400 font-medium">Zorluk Seviyesi {s.difficultyReached}</span>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <div className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-slate-400">Tepki:</span>
                  <span className="font-bold text-white">{s.averageReactionTimeMs} ms</span>
                </div>

                <div className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-400">İsabet:</span>
                  <span className="font-bold text-emerald-400">%{s.accuracy}</span>
                </div>

                <div className="bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-400">Skor:</span>
                  <span className="font-black text-amber-300">{s.score}</span>
                </div>
              </div>
            </div>

            {/* In-depth error diagnosis row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 px-3 bg-slate-950/60 rounded-lg text-[11px] border border-slate-800/50 mb-3">
              <div className="text-slate-400">
                <span className="text-slate-500">Kural Geçiş Hataları: </span>
                <span className={s.breakdown.ruleSwitchErrors > 0 ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>
                  {s.breakdown.ruleSwitchErrors} kez
                </span>
              </div>
              <div className="text-slate-400">
                <span className="text-slate-500">Çeldirici Yanılmaları: </span>
                <span className={s.breakdown.distractorErrors > 0 ? "text-amber-400 font-semibold" : "text-emerald-400 font-semibold"}>
                  {s.breakdown.distractorErrors} kez
                </span>
              </div>
              <div className="text-slate-400">
                <span className="text-slate-500">Yorgunluk Başlangıcı: </span>
                <span className="text-sky-300 font-semibold">
                  {Math.round(s.breakdown.cognitiveFatigueOnsetMs / 1000)}. saniye
                </span>
              </div>
            </div>

            {/* Cognitive Far-Transfer Actionable Takeaway */}
            <div className="text-xs text-slate-300 bg-sky-500/5 border border-sky-500/10 p-2.5 rounded-lg flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5" />
              <div>
                <span className="font-semibold text-sky-300">Gelişim Yorumu: </span>
                <span>{s.farTransferFeedback}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
