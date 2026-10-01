'use client';

import React from 'react';
import { AntiPlateauTelemetry } from '@/types/cognitive';
import { ShieldCheck, Activity, AlertTriangle, Cpu, Zap, Info } from 'lucide-react';

interface AntiPlateauMonitorProps {
  telemetry: AntiPlateauTelemetry;
}

export const AntiPlateauMonitor: React.FC<AntiPlateauMonitorProps> = ({ telemetry }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-wide">
                Anti-Plato ve Nöral Adaptasyon Motoru
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-[10px] font-bold text-cyan-300">
                AKTİF KORUMA
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Kas hafızasını engelleyen, kuralları dinamik esneten bilişsel yük dengeleyici.
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Kural Entropisi:</span>
          <span className="font-bold text-emerald-400">{telemetry.currentRuleEntropy}</span>
        </div>
      </div>

      {/* 3 Core Metric Meters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Metric 1 */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              Nöral Plastisite Uyarımı
            </span>
            <span className="text-xs font-bold text-cyan-400">%{telemetry.adaptationIndex}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
              style={{ width: `${telemetry.adaptationIndex}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Beynin otomatik pilota geçmeyip aktif problem çözme durumunda kalma oranı.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Kas Hafızası Kırma İndeksi
            </span>
            <span className="text-xs font-bold text-purple-400">%{telemetry.muscleMemoryMitigation}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              style={{ width: `${telemetry.muscleMemoryMitigation}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Rutinleşen tepkilerin rastgele distractor ve kural tersinimiyle kırılma başarısı.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Çeldirici (Distractor) Direnci
            </span>
            <span className="text-xs font-bold text-amber-400">%{telemetry.distractorResistance}</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
              style={{ width: `${telemetry.distractorResistance}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Beklenmedik görsel yanılmalara rağmen doğru stratejiyi koruma kapasitesi.
          </p>
        </div>
      </div>

      {/* Bottom Live Intervention Banner */}
      <div className="bg-gradient-to-r from-slate-900/90 via-cyan-950/20 to-slate-900/90 border border-cyan-500/20 rounded-xl p-3 flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-300 shrink-0">
          <Info className="w-4 h-4" />
        </div>
        <div className="text-xs text-slate-300">
          <span className="font-semibold text-white mr-1.5">Son Adaptif Müdahale:</span>
          {telemetry.lastIntervention}
        </div>
      </div>
    </div>
  );
};
