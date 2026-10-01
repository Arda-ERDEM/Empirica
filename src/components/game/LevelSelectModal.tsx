'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LevelProgress } from '@/types/gameProgress';
import { Star, Lock, X } from 'lucide-react';

interface LevelSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameTitle: string;
  gameType: string;
  levels: LevelProgress[];
  currentLevel: number;
  onSelectLevel: (levelNum: number) => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  isOpen,
  onClose,
  gameTitle,
  levels,
  currentLevel,
  onSelectLevel,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] font-sans text-gray-900"
        >
          {/* Classic Blazor Title Bar */}
          <div className="bg-[#1b2a47] text-white px-4 py-3 flex items-center justify-between border-b border-gray-400">
            <div>
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span>{gameTitle}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-600/40 text-blue-200 border border-blue-400 font-semibold">
                  20 Seviye
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Basitten zora doğru ilerleyin. Tamamlanan seviyelerde 3 yıldız toplayın.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-red-600 rounded text-slate-200 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Level Grid (5x4) */}
          <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {levels.map((lvl) => {
                const isCurrent = lvl.levelNumber === currentLevel;

                return (
                  <button
                    key={`lvl-btn-${lvl.levelNumber}`}
                    disabled={!lvl.unlocked}
                    onClick={() => {
                      onSelectLevel(lvl.levelNumber);
                      onClose();
                    }}
                    className={`relative p-3 rounded-lg flex flex-col items-center justify-between transition-all aspect-square border ${
                      !lvl.unlocked
                        ? 'bg-gray-200/70 border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
                        : isCurrent
                        ? 'bg-blue-50 border-2 border-blue-600 shadow-sm text-blue-900 scale-105'
                        : lvl.completed
                        ? 'bg-white border-emerald-400 text-gray-800 hover:border-emerald-600 hover:bg-emerald-50/30'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-blue-500 hover:shadow'
                    }`}
                  >
                    {/* Level Number or Lock Icon */}
                    <div className="flex-1 flex items-center justify-center">
                      {!lvl.unlocked ? (
                        <Lock className="w-5 h-5 text-gray-400" />
                      ) : (
                        <span
                          className={`text-lg font-bold ${
                            isCurrent ? 'text-blue-700' : 'text-gray-800'
                          }`}
                        >
                          {lvl.levelNumber}
                        </span>
                      )}
                    </div>

                    {/* Stars Earned */}
                    {lvl.unlocked && (
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={`star-${lvl.levelNumber}-${starIdx}`}
                            className={`w-3.5 h-3.5 ${
                              starIdx <= lvl.stars
                                ? 'text-amber-500 fill-amber-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="bg-gray-100 border-t border-gray-300 px-4 py-2.5 flex items-center justify-between text-xs text-gray-600">
            <span>Kilitli seviyeler önceki aşama geçildiğinde otomatik açılır.</span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded text-xs font-semibold"
            >
              Kapat
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
