'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { sounds } from '@/utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Brain,
  X,
  RotateCcw,
  Grid,
  Heart,
  Trophy,
  Coins,
  Star,
  CheckCircle,
  AlertCircle,
  Play,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PatternMatrixGameProps {
  onClose: () => void;
  onOpenLevelSelect?: () => void;
}

export const PatternMatrixGame: React.FC<PatternMatrixGameProps> = ({
  onClose,
  onOpenLevelSelect,
}) => {
  const {
    selectedPatternLevel,
    selectPatternLevel,
    completePatternLevel,
    patternLevels,
  } = useGameStore();

  // Level configuration generator (1-20)
  const getLevelConfig = (lvl: number) => {
    let size = 3;
    let targetCount = 3;
    let memorizeMs = 2000;

    if (lvl <= 3) {
      size = 3;
      targetCount = 2 + lvl; // 3, 4, 5
      memorizeMs = 2200 - lvl * 150;
    } else if (lvl <= 7) {
      size = 4;
      targetCount = 3 + (lvl - 3); // 4, 5, 6, 7
      memorizeMs = 2000 - (lvl - 3) * 150;
    } else if (lvl <= 12) {
      size = 4;
      targetCount = 5 + Math.floor((lvl - 7) / 2); // 5, 6, 7
      memorizeMs = 1500 - (lvl - 7) * 80;
    } else if (lvl <= 16) {
      size = 5;
      targetCount = 6 + Math.floor((lvl - 12) / 2); // 6, 7, 8
      memorizeMs = 1400 - (lvl - 12) * 80;
    } else {
      size = 5;
      targetCount = 7 + (lvl - 16); // 7, 8, 9, 10
      memorizeMs = 1100 - (lvl - 16) * 50;
    }

    return { size, targetCount, memorizeMs };
  };

  const config = getLevelConfig(selectedPatternLevel);
  const totalTiles = config.size * config.size;

  const [gameState, setGameState] = useState<
    'preview' | 'memorize' | 'recall' | 'level_won' | 'game_over'
  >('preview');

  const [targetIndices, setTargetIndices] = useState<number[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [mistakeIndices, setMistakeIndices] = useState<number[]>([]);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [countdown, setCountdown] = useState(3);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate pattern
  const startNewRound = useCallback(() => {
    const indices: number[] = [];
    while (indices.length < config.targetCount) {
      const rand = Math.floor(Math.random() * totalTiles);
      if (!indices.includes(rand)) {
        indices.push(rand);
      }
    }
    setTargetIndices(indices);
    setSelectedIndices([]);
    setMistakeIndices([]);
    setGameState('preview');
    setCountdown(3);
  }, [config.targetCount, totalTiles]);

  // Handle Level Start / Reset
  useEffect(() => {
    setLives(3);
    setScore(0);
    setRound(1);
    startNewRound();
  }, [selectedPatternLevel, startNewRound]);

  // Countdown timer
  useEffect(() => {
    if (gameState === 'preview') {
      if (countdown > 0) {
        timerRef.current = setTimeout(() => {
          setCountdown((prev) => prev - 1);
        }, 700);
      } else {
        setGameState('memorize');
        sounds.playClick();
        timerRef.current = setTimeout(() => {
          setGameState('recall');
          sounds.playSuccess();
        }, config.memorizeMs);
      }
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [gameState, countdown, config.memorizeMs]);

  // Handle tile click
  const handleTileClick = (index: number) => {
    if (gameState !== 'recall') return;
    if (selectedIndices.includes(index) || mistakeIndices.includes(index)) return;

    if (targetIndices.includes(index)) {
      // Correct tile
      sounds.playClick();
      const updated = [...selectedIndices, index];
      setSelectedIndices(updated);
      setScore((prev) => prev + 150);

      // Check if all targets found
      if (updated.length === targetIndices.length) {
        if (round < 2) {
          // Advance to round 2
          sounds.playSuccess();
          setTimeout(() => {
            setRound((r) => r + 1);
            startNewRound();
          }, 800);
        } else {
          // Level Completed!
          handleLevelComplete();
        }
      }
    } else {
      // Wrong tile!
      sounds.playError();
      setMistakeIndices((prev) => [...prev, index]);
      const updatedLives = lives - 1;
      setLives(updatedLives);

      if (updatedLives <= 0) {
        setGameState('game_over');
      }
    }
  };

  const handleLevelComplete = () => {
    sounds.playLevelComplete();
    setGameState('level_won');

    // Calculate stars
    const starsEarned = lives === 3 ? 3 : lives === 2 ? 2 : 1;
    const finalScore = score + lives * 250;
    const coinsEarned = 20 + starsEarned * 5;

    completePatternLevel(selectedPatternLevel, starsEarned, finalScore, coinsEarned);

    try {
      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  };

  const nextLevel = () => {
    if (selectedPatternLevel < 20) {
      selectPatternLevel(selectedPatternLevel + 1);
    } else {
      onClose();
    }
  };

  const restartLevel = () => {
    setLives(3);
    setScore(0);
    setRound(1);
    startNewRound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl">
      <div className="relative w-full max-w-xl bg-slate-950 border border-sky-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">Pattern Matrix</span>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold text-xs border border-sky-500/30">
                  Seviye {selectedPatternLevel} / 20
                </span>
              </div>
              <span className="text-xs text-slate-400">Tur {round} / 2 - Kısa Süreli Mekânsal Bellek</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLevelSelect && (
              <button
                onClick={onOpenLevelSelect}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-400 text-slate-300 transition-colors"
                title="Seviyeler"
              >
                <Grid className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:text-white hover:border-red-400 text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats bar (Lives, Targets Found, Score) */}
        <div className="grid grid-cols-3 gap-2 py-4">
          {/* Lives */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Can</span>
            <div className="flex items-center justify-center gap-1 mt-1">
              {[1, 2, 3].map((heart) => (
                <Heart
                  key={heart}
                  className={`w-4 h-4 ${
                    heart <= lives
                      ? 'text-red-500 fill-red-500 animate-pulse'
                      : 'text-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Targets Left */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Hedefler</span>
            <span className="text-sm font-black text-sky-400 mt-0.5 block">
              {selectedIndices.length} / {config.targetCount}
            </span>
          </div>

          {/* Score */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Puan</span>
            <span className="text-sm font-black text-amber-400 mt-0.5 block">
              {score}
            </span>
          </div>
        </div>

        {/* Status Prompt */}
        <div className="text-center py-2 min-h-[3rem] flex items-center justify-center">
          {gameState === 'preview' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-amber-400 font-bold text-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>Hazırlanın... {countdown}</span>
            </motion.div>
          )}
          {gameState === 'memorize' && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-sky-300 font-bold text-sm animate-pulse flex items-center gap-2"
            >
              <span>👁️ Yanan Mavi Kareleri Ezberleyin!</span>
            </motion.div>
          )}
          {gameState === 'recall' && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-emerald-400 font-bold text-sm flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Ezberlediğiniz karelere dokunun!</span>
            </motion.div>
          )}
        </div>

        {/* Game Matrix Grid */}
        <div className="flex-1 flex items-center justify-center p-3">
          <div
            className="grid gap-2.5 sm:gap-3 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-inner w-full max-w-sm aspect-square"
            style={{
              gridTemplateColumns: `repeat(${config.size}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: totalTiles }).map((_, index) => {
              const isTarget = targetIndices.includes(index);
              const isMemorizing = gameState === 'memorize' && isTarget;
              const isCorrectlySelected = selectedIndices.includes(index);
              const isWrongSelected = mistakeIndices.includes(index);

              return (
                <motion.button
                  key={index}
                  whileTap={gameState === 'recall' ? { scale: 0.92 } : {}}
                  disabled={gameState !== 'recall' || isCorrectlySelected || isWrongSelected}
                  onClick={() => handleTileClick(index)}
                  className={`rounded-2xl transition-all duration-300 flex items-center justify-center relative font-black text-sm select-none aspect-square ${
                    isMemorizing
                      ? 'bg-gradient-to-tr from-sky-400 to-cyan-300 border-2 border-white shadow-lg shadow-sky-500/50 scale-105'
                      : isCorrectlySelected
                      ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-white shadow-lg shadow-emerald-500/40 text-white'
                      : isWrongSelected
                      ? 'bg-red-500/80 border-2 border-red-400 text-white animate-shake'
                      : 'bg-slate-800/80 border border-slate-700/60 hover:border-sky-400/60 hover:bg-slate-800'
                  }`}
                >
                  {isCorrectlySelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <CheckCircle className="w-6 h-6 text-white stroke-[2.5]" />
                    </motion.div>
                  )}
                  {isWrongSelected && (
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <AlertCircle className="w-6 h-6 text-white stroke-[2.5]" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Win Modal Overlay */}
        <AnimatePresence>
          {gameState === 'level_won' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 z-20"
            >
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Seviye Tamamlandı!</h3>
                <p className="text-xs text-slate-400 mt-1">Mekânsal hafıza matrisini başarıyla çözdün.</p>
              </div>

              {/* Stars */}
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-7 h-7 ${
                      star <= (lives === 3 ? 3 : lives === 2 ? 2 : 1)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              {/* Coins & Score */}
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl text-xs font-bold">
                <span className="text-amber-400">+{20 + (lives === 3 ? 15 : 5)} 🪙 Altın</span>
                <span className="text-slate-400">|</span>
                <span className="text-sky-400">{score + lives * 250} Puan</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 w-full max-w-xs">
                <button
                  onClick={restartLevel}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                  title="Tekrar Oyna"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={nextLevel}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30"
                >
                  <span>Sonraki Seviye</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Game Over Modal */}
          {gameState === 'game_over' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 z-20"
            >
              <div className="w-16 h-16 rounded-3xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Canlar Tükendi</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Kısa süreli hafızanı toparla ve seviyeyi baştan dene!
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 w-full max-w-xs">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Menüye Dön
                </button>
                <button
                  onClick={restartLevel}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/25"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tekrar Dene</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
