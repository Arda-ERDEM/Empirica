'use client';

import React from 'react';
import { useCognitiveStore } from '@/store/cognitiveStore';
import { Brain, Flame, Activity, ShieldCheck, Play, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onStartGame?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onStartGame }) => {
  const { profile, resetProgress } = useCognitiveStore();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Philosophy */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-600 p-[1.5px] shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-[#070913] rounded-[10px] flex items-center justify-center text-sky-400">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black tracking-wider bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
                EMPIRICA
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 tracking-widest uppercase">
                COGNITION
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-tight hidden sm:block">
              Duyusal Deneyim & Anti-Plato Bilişsel Laboratuvarı
            </p>
          </div>
        </div>

        {/* Cognitive Quick Stats */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* CPI Score Pill */}
          <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <Activity className="w-4 h-4 text-sky-400" />
            <div>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                Bilişsel Endeks (CPI)
              </div>
              <div className="text-sm font-extrabold text-white flex items-center gap-1">
                {profile.cpiScore}
                <span className="text-[10px] font-semibold text-emerald-400">
                  (Üst %{100 - profile.percentileRank})
                </span>
              </div>
            </div>
          </div>

          {/* Streak Counter */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-bounce" />
            <span>{profile.streakDays} Gün Seri</span>
          </div>

          {/* Reset / Demo Action */}
          <button
            onClick={() => {
              if (confirm('Profil verilerini fabrika ayarlarına döndürmek istiyor musunuz?')) {
                resetProgress();
              }
            }}
            title="Verileri Sıfırla"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Start Daily Workout Button */}
          <button
            onClick={onStartGame}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-sky-500/25 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Egzersizi Başlat</span>
          </button>
        </div>

      </div>
    </header>
  );
};
