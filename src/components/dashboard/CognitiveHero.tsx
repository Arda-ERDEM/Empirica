'use client';

import React from 'react';
import { UserCognitiveProfile } from '@/types/cognitive';
import { Sparkles, Play, ShieldAlert, Cpu, ArrowRight, BrainCircuit } from 'lucide-react';

interface CognitiveHeroProps {
  profile: UserCognitiveProfile;
  onLaunchWorkout: () => void;
  activeGameType?: 'maze' | 'shift';
  onSelectGameType?: (type: 'maze' | 'shift') => void;
}

export const CognitiveHero: React.FC<CognitiveHeroProps> = ({
  profile,
  onLaunchWorkout,
  activeGameType = 'maze',
  onSelectGameType,
}) => {
  return (
    <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden border border-sky-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950/95 to-[#070913] shadow-2xl">
      {/* Decorative Neon Blurs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left Column: Greeting & Philosophy */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-semibold text-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Empirizm Felsefesi: Tabula Rasa & Dinamik Nöral Gelişim</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Soyut Ezberi Bırakın, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Gerçek Hayata Aktarılabilir Zeka
            </span> İnşa Edin.
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Lumosity’nin aksine, oyunlarımızı sadece o oyunu iyi oynamanız için değil; 
            iş hayatında hızlı kriz yönetimi, yoğun dikkat dağınıklığını filtreleme ve anlık kararlarda 
            <strong className="text-white"> plato çizmenizi engelleyen adaptif algoritmalarla </strong> geliştirdik.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Plato Önleyici: <strong>Aktif</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>Uzak Aktarım (Far Transfer): <strong>%32 Doğrulanmış Artış</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Nöral Reaksiyon Eşiği: <strong>242ms</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Featured Game / Today's Prescription */}
        <div className="lg:w-80 w-full shrink-0">
          <div className="glass-panel-glow rounded-2xl p-5 border border-sky-500/30 flex flex-col justify-between h-full relative group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded">
                  Günün Reçetesi
                </span>
                <span className="text-xs font-bold text-amber-400">Seviye 7 Adaptasyon</span>
              </div>

              {/* Quick Game Switcher Tabs */}
              <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800 gap-1">
                <button
                  type="button"
                  onClick={() => onSelectGameType?.('maze')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    activeGameType === 'maze'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🧩 Neural Maze (Mantık)
                </button>
                <button
                  type="button"
                  onClick={() => onSelectGameType?.('shift')}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all ${
                    activeGameType === 'shift'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ⚡ NeuroShift (Refleks)
                </button>
              </div>

              {activeGameType === 'maze' ? (
                <>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Neural Maze: Mantık Labirenti
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Sınırlı hamle bütçesi, lazer kapıları ve kilit anahtarları. Derin mantık ve rota planlama simülasyonu.
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hedef Bilişsel Alan:</span>
                      <span className="font-semibold text-emerald-400">Mantık & Problem Çözme</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pratik Kazanım:</span>
                      <span className="font-semibold text-sky-400">3 Adım Sonrasını Simüle Etme</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                      NeuroShift: Çapraz Kural
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Kuralları sürekli değişen, kas hafızasını kıran Dikkat & Bilişsel Esneklik simülasyonu.
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Hedef Bilişsel Alan:</span>
                      <span className="font-semibold text-purple-300">Esneklik & Dikkat</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pratik Kazanım:</span>
                      <span className="font-semibold text-emerald-400">Kriz Anında Hızlı Yön Değişimi</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onLaunchWorkout}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Bugünkü Seansı Başlat</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
