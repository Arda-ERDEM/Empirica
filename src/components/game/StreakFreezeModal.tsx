'use client';

import React, { useState } from 'react';
import { Snowflake, ShieldCheck, Coins, Flame, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface StreakFreezeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreakFreezeModal: React.FC<StreakFreezeModalProps> = ({ isOpen, onClose }) => {
  const { totalCoins, streakFreezes, streakDays, buyStreakFreeze, useStreakFreeze } = useGameStore();
  const [purchaseMsg, setPurchaseMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleBuy = () => {
    const success = buyStreakFreeze();
    if (!success) {
      setPurchaseMsg({ type: 'error', text: 'Yetersiz Bakiye! En az 50 🪙 altın gereklidir.' });
    } else {
      setPurchaseMsg({ type: 'success', text: '+1 Seri Dondurma hakkı eklendi. Seriniz güvende! ❄️' });
    }
    setTimeout(() => setPurchaseMsg(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-sans text-gray-900">
      <div className="relative max-w-md w-full bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden space-y-4">
        {/* Classic Blazor Header */}
        <div className="bg-[#1b2a47] text-white px-4 py-3 flex items-center justify-between border-b border-gray-400">
          <div className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-cyan-300" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Seri Dondurma (Streak Freeze)</h3>
              <p className="text-[11px] text-slate-300">Günlük İlerleme Koruma Servisi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 pt-1 space-y-4 text-xs">
          {/* Current Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-center">
              <Flame className="w-5 h-5 text-amber-600 mx-auto mb-1 fill-amber-500" />
              <span className="text-gray-600 font-medium block">Mevcut Seri</span>
              <span className="text-lg font-bold text-amber-800">{streakDays} Gün</span>
            </div>

            <div className="bg-cyan-50 p-3 rounded-lg border border-cyan-200 text-center">
              <Snowflake className="w-5 h-5 text-cyan-600 mx-auto mb-1" />
              <span className="text-gray-600 font-medium block">Aktif Dondurma</span>
              <span className="text-lg font-bold text-cyan-800">{streakFreezes} Adet</span>
            </div>
          </div>

          {/* Explanation Alert */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 leading-relaxed space-y-1">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Nasıl Çalışır?</span>
            </div>
            <p className="text-[11px] text-gray-600">
              Giremediğiniz günlerde günlük serinizi kaybetmezsiniz. Dondurma hakkınız otomatik olarak devreye girerek serinizi korur.
            </p>
          </div>

          {/* Status message */}
          {purchaseMsg && (
            <div
              className={`p-2.5 rounded text-xs font-semibold flex items-center gap-2 border ${
                purchaseMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-red-50 text-red-800 border-red-300'
              }`}
            >
              {purchaseMsg.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{purchaseMsg.text}</span>
            </div>
          )}

          {/* Buy Button */}
          <div className="pt-1">
            <button
              onClick={handleBuy}
              className="w-full py-2.5 px-4 rounded bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <Coins className="w-4 h-4 fill-yellow-400 text-yellow-300" />
              <span>50 🪙 Altın ile +1 Dondurma Satın Al (Bakiye: {totalCoins})</span>
            </button>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="w-full py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs border border-gray-300 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
