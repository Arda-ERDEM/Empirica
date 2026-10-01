'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { sounds } from '@/utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Calculator,
  X,
  RotateCcw,
  Grid,
  Trophy,
  Coins,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';

interface SpeedMathGameProps {
  onClose: () => void;
  onOpenLevelSelect?: () => void;
}

interface Question {
  text: string;
  answer: number;
  options: number[];
}

export const SpeedMathGame: React.FC<SpeedMathGameProps> = ({
  onClose,
  onOpenLevelSelect,
}) => {
  const {
    selectedMathLevel,
    selectMathLevel,
    completeMathLevel,
  } = useGameStore();

  const totalQuestions = 8;
  const initialTimeSec = Math.max(16, 24 - Math.floor(selectedMathLevel / 3));

  const [gameState, setGameState] = useState<'playing' | 'level_won' | 'game_over'>('playing');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(initialTimeSec);
  const [question, setQuestion] = useState<Question | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate question based on level
  const generateQuestion = useCallback((lvl: number): Question => {
    let text = '';
    let answer = 0;

    if (lvl <= 4) {
      // Basic addition & subtraction
      const a = Math.floor(Math.random() * 25) + 5;
      const b = Math.floor(Math.random() * 25) + 5;
      const isAdd = Math.random() > 0.4;
      if (isAdd) {
        text = `${a} + ${b} = ?`;
        answer = a + b;
      } else {
        const big = Math.max(a, b);
        const small = Math.min(a, b);
        text = `${big} - ${small} = ?`;
        answer = big - small;
      }
    } else if (lvl <= 9) {
      // Multiplication & division
      const a = Math.floor(Math.random() * 9) + 3;
      const b = Math.floor(Math.random() * 9) + 2;
      const isMult = Math.random() > 0.35;
      if (isMult) {
        text = `${a} × ${b} = ?`;
        answer = a * b;
      } else {
        const prod = a * b;
        text = `${prod} ÷ ${a} = ?`;
        answer = b;
      }
    } else if (lvl <= 14) {
      // Equation balancer: a + b = ? + c
      const a = Math.floor(Math.random() * 15) + 5;
      const b = Math.floor(Math.random() * 15) + 5;
      const c = Math.floor(Math.random() * 8) + 2;
      const sum = a + b;
      answer = sum - c;
      text = `${a} + ${b} = [ ? ] + ${c}`;
    } else {
      // Mixed rapid arithmetic with order of operations
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 5) + 2;
      const c = Math.floor(Math.random() * 15) + 5;
      text = `(${a} × ${b}) + ${c} = ?`;
      answer = a * b + c;
    }

    // Generate 4 distinct options
    const options = new Set<number>([answer]);
    while (options.size < 4) {
      const offset = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const fake = answer + offset;
      if (fake > 0) {
        options.add(fake);
      }
    }

    return {
      text,
      answer,
      options: Array.from(options).sort(() => Math.random() - 0.5),
    };
  }, []);

  // Initial load
  useEffect(() => {
    setCurrentIdx(0);
    setScore(0);
    setCombo(1);
    setTimeLeft(initialTimeSec);
    setGameState('playing');
    setQuestion(generateQuestion(selectedMathLevel));
  }, [selectedMathLevel, initialTimeSec, generateQuestion]);

  // Countdown timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setGameState('game_over');
          sounds.playError();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Handle option selection
  const handleAnswer = (selected: number) => {
    if (gameState !== 'playing' || !question) return;

    if (selected === question.answer) {
      // Correct!
      sounds.playSuccess();
      const points = 100 * combo;
      setScore((s) => s + points);
      setCombo((c) => Math.min(5, c + 1));
      setTimeLeft((t) => Math.min(initialTimeSec + 5, t + 2)); // +2s bonus

      const nextIdx = currentIdx + 1;
      if (nextIdx >= totalQuestions) {
        handleWin();
      } else {
        setCurrentIdx(nextIdx);
        setQuestion(generateQuestion(selectedMathLevel));
      }
    } else {
      // Wrong!
      sounds.playError();
      setCombo(1);
      setTimeLeft((t) => Math.max(1, t - 3)); // -3s penalty
    }
  };

  const handleWin = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sounds.playLevelComplete();
    setGameState('level_won');

    const stars = timeLeft > initialTimeSec * 0.4 ? 3 : 2;
    const finalScore = score + timeLeft * 60;
    const coins = 25 + stars * 5;

    completeMathLevel(selectedMathLevel, stars, finalScore, coins);

    try {
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
    } catch {}
  };

  const restartLevel = () => {
    setCurrentIdx(0);
    setScore(0);
    setCombo(1);
    setTimeLeft(initialTimeSec);
    setGameState('playing');
    setQuestion(generateQuestion(selectedMathLevel));
  };

  const nextLevel = () => {
    if (selectedMathLevel < 20) {
      selectMathLevel(selectedMathLevel + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl">
      <div className="relative w-full max-w-xl bg-slate-950 border border-indigo-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">Speed Math: Sayısal Mantık</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-xs border border-indigo-500/30">
                  Seviye {selectedMathLevel} / 20
                </span>
              </div>
              <span className="text-xs text-slate-400">Zihinsel Aritmetik & Sayısal Çeviklik</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLevelSelect && (
              <button
                onClick={onOpenLevelSelect}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-400 text-slate-300 transition-colors"
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

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 py-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Süre</span>
            <span className={`text-sm font-black ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-amber-400'}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Soru</span>
            <span className="text-sm font-black text-sky-400">
              {currentIdx + 1} / {totalQuestions}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Kombo</span>
            <span className="text-sm font-black text-purple-400">
              {combo}x
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Skor</span>
            <span className="text-sm font-black text-emerald-400">
              {score}
            </span>
          </div>
        </div>

        {/* Question Display Card */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 space-y-6">
          <div className="w-full max-w-sm p-6 rounded-3xl bg-slate-900/90 border border-indigo-500/30 text-center shadow-lg shadow-indigo-950/40">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-2">
              İşlemi Zihninde Çöz
            </span>
            <div className="text-3xl sm:text-4xl font-black text-white tracking-wide font-mono">
              {question?.text}
            </div>
          </div>

          {/* 4 Multiple Choice Options */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {question?.options.map((opt, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.94 }}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleAnswer(opt)}
                className="py-4 px-4 rounded-2xl bg-slate-900/90 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-400 text-white font-black text-xl transition-all shadow-md active:bg-indigo-600 active:text-white"
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Win Overlay */}
        <AnimatePresence>
          {gameState === 'level_won' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 z-20"
            >
              <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-500/20">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">İnanılmaz Hız!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sayısal mantık ve işlem serisini başarıyla tamamladın.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className="w-7 h-7 text-yellow-400 fill-yellow-400"
                  />
                ))}
              </div>

              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl text-xs font-bold">
                <span className="text-amber-400">+{25} 🪙 Altın</span>
                <span className="text-slate-400">|</span>
                <span className="text-sky-400">{score + timeLeft * 60} Puan</span>
              </div>

              <div className="flex items-center gap-3 pt-2 w-full max-w-xs">
                <button
                  onClick={restartLevel}
                  className="p-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={nextLevel}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-600 hover:from-indigo-400 hover:to-sky-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
                >
                  <span>Sonraki Seviye</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

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
                <h3 className="text-2xl font-black text-white">Süre Bitti!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  İşlem temposunu yükselterek yeniden deneyebilirsin.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 w-full max-w-xs">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Menü
                </button>
                <button
                  onClick={restartLevel}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-sky-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/25"
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
