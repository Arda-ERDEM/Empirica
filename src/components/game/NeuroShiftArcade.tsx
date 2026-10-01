'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/utils/audio';
import { useCognitiveStore } from '@/store/cognitiveStore';
import { useGameStore } from '@/store/gameStore';
import { SHIFT_LEVELS, ShiftLevelData } from '@/data/shiftLevels';
import confetti from 'canvas-confetti';
import {
  Zap,
  Timer,
  Flame,
  ArrowRight,
  RotateCcw,
  Trophy,
  X,
  Sparkles,
  Star,
  Coins,
  Grid,
  CheckCircle2,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

export type ShapeType = 'circle' | 'square' | 'triangle' | 'star';
export type ColorType = 'sky' | 'rose' | 'emerald' | 'amber';
export type RuleType = 'color' | 'shape';

interface CardItem {
  shape: ShapeType;
  color: ColorType;
  distractorText?: string;
  distractorColor?: ColorType;
}

const SHAPES: ShapeType[] = ['circle', 'square', 'triangle', 'star'];
const COLORS: ColorType[] = ['sky', 'rose', 'emerald', 'amber'];

const COLOR_MAP: Record<ColorType, { name: string; hex: string }> = {
  sky: { name: 'Mavi', hex: '#38bdf8' },
  rose: { name: 'Kırmızı', hex: '#f43f5e' },
  emerald: { name: 'Yeşil', hex: '#10b981' },
  amber: { name: 'Sarı', hex: '#f59e0b' },
};

const SHAPE_NAMES: Record<ShapeType, string> = {
  circle: 'Daire',
  square: 'Kare',
  triangle: 'Üçgen',
  star: 'Yıldız',
};

const RenderShape = ({ shape, color, size = 64 }: { shape: ShapeType; color: ColorType; size?: number }) => {
  const hex = COLOR_MAP[color].hex;
  switch (shape) {
    case 'circle':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="filter drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]">
          <circle cx="50" cy="50" r="42" fill={hex} />
        </svg>
      );
    case 'square':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="filter drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]">
          <rect x="12" y="12" width="76" height="76" rx="14" fill={hex} />
        </svg>
      );
    case 'triangle':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="filter drop-shadow-[0_0_12px_rgba(16,185,129,0.5)]">
          <polygon points="50,10 92,86 8,86" rx="8" fill={hex} />
        </svg>
      );
    case 'star':
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="filter drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]">
          <polygon points="50,5 64,36 98,39 72,63 80,97 50,78 20,97 28,63 2,39 36,36" fill={hex} />
        </svg>
      );
  }
};

interface NeuroShiftArcadeProps {
  onClose: () => void;
  onOpenLevelSelect?: () => void;
}

export const NeuroShiftArcade: React.FC<NeuroShiftArcadeProps> = ({ onClose, onOpenLevelSelect }) => {
  const { recordSessionResult } = useCognitiveStore();
  const {
    selectedShiftLevel,
    selectShiftLevel,
    completeShiftLevel,
    addCoins,
  } = useGameStore();

  const levelIdx = Math.max(0, Math.min(SHIFT_LEVELS.length - 1, selectedShiftLevel - 1));
  const level: ShiftLevelData = SHIFT_LEVELS[levelIdx];

  // Game Lifecycle: 'countdown' | 'playing' | 'level_cleared' | 'game_over'
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'level_cleared' | 'game_over'>('countdown');
  const [countdown, setCountdown] = useState<number>(3);

  // Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [completedMatches, setCompletedMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(level.timeLimitSeconds);
  const [currentRule, setCurrentRule] = useState<RuleType>('color');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [ruleShiftBanner, setRuleShiftBanner] = useState<string | null>(null);
  const [showInGameTip, setShowInGameTip] = useState(false);

  // Cards
  const [targetCard, setTargetCard] = useState<CardItem>({ shape: 'circle', color: 'sky' });
  const [options, setOptions] = useState<{ left: CardItem; right: CardItem; correctSide: 'left' | 'right' }>({
    left: { shape: 'circle', color: 'rose' },
    right: { shape: 'square', color: 'sky' },
    correctSide: 'right',
  });

  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [starsEarned, setStarsEarned] = useState(1);

  // Generate round
  const generateTrial = useCallback((rule: RuleType, currentStreak: number) => {
    const targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    let distractorText: string | undefined = undefined;
    let distractorColor: ColorType | undefined = undefined;
    if (level.hasDistractorWords && Math.random() > 0.4) {
      const otherColors = COLORS.filter((c) => c !== targetColor);
      distractorColor = otherColors[Math.floor(Math.random() * otherColors.length)];
      distractorText = COLOR_MAP[distractorColor].name.toUpperCase();
    }

    const newTarget: CardItem = { shape: targetShape, color: targetColor, distractorText, distractorColor };
    const correctSide = Math.random() > 0.5 ? 'left' : 'right';

    let correctCard: CardItem;
    let wrongCard: CardItem;

    if (rule === 'color') {
      const otherShapes = SHAPES.filter((s) => s !== targetShape);
      correctCard = { shape: otherShapes[Math.floor(Math.random() * otherShapes.length)], color: targetColor };
      const otherColors = COLORS.filter((c) => c !== targetColor);
      wrongCard = { shape: targetShape, color: otherColors[Math.floor(Math.random() * otherColors.length)] };
    } else {
      const otherColors = COLORS.filter((c) => c !== targetColor);
      correctCard = { shape: targetShape, color: otherColors[Math.floor(Math.random() * otherColors.length)] };
      const otherShapes = SHAPES.filter((s) => s !== targetShape);
      wrongCard = { shape: otherShapes[Math.floor(Math.random() * otherShapes.length)], color: targetColor };
    }

    setTargetCard(newTarget);
    setOptions({
      left: correctSide === 'left' ? correctCard : wrongCard,
      right: correctSide === 'right' ? correctCard : wrongCard,
      correctSide,
    });
  }, [level]);

  // Reset round on level switch
  useEffect(() => {
    setScore(0);
    setStreak(0);
    setCoinsEarned(0);
    setCompletedMatches(0);
    setTimeLeft(level.timeLimitSeconds);
    setCurrentRule('color');
    setConsecutiveCorrect(0);
    setCountdown(3);
    setGameState('countdown');
  }, [level]);

  // Countdown timer
  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown((c) => c - 1), 700);
        return () => clearTimeout(timer);
      } else {
        setGameState('playing');
        generateTrial('color', 0);
      }
    }
  }, [gameState, countdown, generateTrial]);

  // In-game timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          sounds.playWrong();
          setGameState('game_over');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Handle user response
  const handleAnswer = (chosenSide: 'left' | 'right') => {
    if (gameState !== 'playing') return;

    const isCorrect = chosenSide === options.correctSide;

    if (isCorrect) {
      sounds.playCorrect();
      setLastFeedback('correct');

      const newStreak = streak + 1;
      setStreak(newStreak);

      const multiplier = Math.min(4, Math.floor(newStreak / 3) + 1);
      const points = 100 * multiplier;
      setScore((s) => s + points);

      const coinGain = 10 * multiplier;
      setCoinsEarned((c) => c + coinGain);
      addCoins(coinGain);

      const newMatches = completedMatches + 1;
      setCompletedMatches(newMatches);

      // Check level clear
      if (newMatches >= level.targetCount) {
        const stars = timeLeft > 10 ? 3 : timeLeft > 5 ? 2 : 1;
        setStarsEarned(stars);
        setGameState('level_cleared');
        sounds.playGameComplete();
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

        completeShiftLevel(level.levelNumber, stars, score + points, coinsEarned + coinGain + 50);
        recordSessionResult({
          id: `session-shift-lvl${level.levelNumber}-${Date.now()}`,
          gameId: 'neuro-shift',
          gameTitle: `NeuroShift (Seviye ${level.levelNumber})`,
          domain: 'speed',
          timestamp: 'Az önce',
          score: score + points,
          accuracy: 95,
          averageReactionTimeMs: 240,
          peakStreak: newStreak,
          difficultyReached: level.levelNumber,
          ruleShiftsHandled: Math.floor(newMatches / level.ruleShiftEvery),
          plateauBreakerBonus: stars * 120,
          breakdown: {
            ruleSwitchErrors: 0,
            distractorErrors: 0,
            speedVsAccuracyBalance: 'Yüksek Hız & Kombo',
            cognitiveFatigueOnsetMs: 30000,
          },
          farTransferFeedback: `Seviye ${level.levelNumber} başarıyla tamamlandı. Refleksik tepki süreniz ve odaklanma direnciniz üst düzeyde.`,
        });
        return;
      }

      // Check rule shift
      const nextConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(nextConsecutive);

      if (nextConsecutive >= level.ruleShiftEvery) {
        const nextRule: RuleType = currentRule === 'color' ? 'shape' : 'color';
        setCurrentRule(nextRule);
        setConsecutiveCorrect(0);
        sounds.playRuleShift();

        setRuleShiftBanner(
          nextRule === 'color' ? '⚡ KURAL: ARTIK RENGE GÖRE SEÇ!' : '⚡ KURAL: ARTIK ŞEKLE GÖRE SEÇ!'
        );
        setTimeout(() => setRuleShiftBanner(null), 1200);

        generateTrial(nextRule, newStreak);
      } else {
        generateTrial(currentRule, newStreak);
      }
    } else {
      sounds.playWrong();
      setLastFeedback('wrong');
      setStreak(0);
      setConsecutiveCorrect(0);
      generateTrial(currentRule, 0);
    }

    setTimeout(() => setLastFeedback(null), 300);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        handleAnswer('left');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        handleAnswer('right');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, options, handleAnswer, onClose]);

  const handleNextLevel = () => {
    const nextLvl = Math.min(SHIFT_LEVELS.length, level.levelNumber + 1);
    selectShiftLevel(nextLvl);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-purple-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[580px]">
        {/* Glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLevelSelect}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-400 text-purple-400 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <Grid className="w-4 h-4" />
              <span>Seviyeler</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">{level.title}</h2>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30">
                  {completedMatches} / {level.targetCount} Eşleşme
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{level.tip}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Coins */}
            <div className="hidden xs:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
              <Coins className="w-3.5 h-3.5 fill-amber-400/20" />
              <span>+{coinsEarned} 🪙</span>
            </div>

            {/* Timer */}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-sky-300">
              <Timer className="w-3.5 h-3.5 text-sky-400" />
              <span>{timeLeft}s</span>
            </div>

            {/* Coach Tip Button */}
            <button
              onClick={() => setShowInGameTip(!showInGameTip)}
              className="px-2 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 text-xs font-bold transition-all flex items-center gap-1 shrink-0"
              title="Nöro-Koç İpucu"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">İpucu</span>
            </button>

            {/* Pinned Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-rose-500/20 hover:border-rose-500/50 transition-all shrink-0 ml-1"
              title="Oyundan Çık (Esc)"
            >
              <X className="w-5 h-5 text-slate-300 hover:text-white" />
            </button>
          </div>
        </div>

        {/* Nöro-Koç Stroop & Hız İpucu Bannerı */}
        {showInGameTip && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-xs text-amber-200 flex items-start justify-between gap-3 shadow-lg relative z-20 my-2">
            <div className="flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-bold block mb-0.5">Seviye {level.levelNumber} Nöro-Koç Tavsiyesi:</strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">{level.tip}</p>
                <div className="text-[10px] text-amber-400 mt-1">
                  Hedef: {level.targetCount} Eşleşme | Stroop Çeldiricileri: {level.hasDistractorWords ? 'Aktif (Metni okumayın, şekle bakın)' : 'Pasif'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInGameTip(false)}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* --- STATE 1: COUNTDOWN --- */}
        {gameState === 'countdown' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Zap className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">Hazır Ol!</h3>
            <p className="text-xs text-slate-400 max-w-xs">
              Yukarıdaki kurala göre eşleşen karta tıkla. Kombo yaptıkça paralar katlanır!
            </p>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-sky-400">
              {countdown > 0 ? countdown : 'BAŞLA!'}
            </div>
          </div>
        )}

        {/* --- STATE 2: PLAYING --- */}
        {gameState === 'playing' && (
          <div className="flex-1 flex flex-col justify-between py-4 space-y-3 relative">
            {/* Visual Flash */}
            <AnimatePresence>
              {lastFeedback && (
                <motion.div
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  className={`absolute inset-0 pointer-events-none rounded-2xl ${
                    lastFeedback === 'correct' ? 'bg-emerald-500/15' : 'bg-rose-500/20'
                  }`}
                />
              )}
            </AnimatePresence>

            {/* Rule Shift Banner */}
            <AnimatePresence>
              {ruleShiftBanner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="absolute top-0 left-0 right-0 z-30 mx-auto max-w-sm p-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs text-center shadow-xl border border-purple-400/40"
                >
                  {ruleShiftBanner}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Active Rule Pill */}
            <div className="text-center">
              <div
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl border text-sm font-black uppercase tracking-wider transition-all shadow-lg ${
                  currentRule === 'color'
                    ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                    : 'bg-purple-500/20 border-purple-400/50 text-purple-300'
                }`}
              >
                {currentRule === 'color' ? '🔵 KURAL: AYNI RENK OLANINI SEÇ' : '🔺 KURAL: AYNI ŞEKİL OLANINI SEÇ'}
              </div>
            </div>

            {/* Center Target Card */}
            <div className="flex flex-col items-center justify-center my-2">
              <motion.div
                key={`${targetCard.shape}-${targetCard.color}`}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 rounded-2xl bg-slate-900 border-2 border-slate-700 flex flex-col items-center justify-center relative shadow-2xl"
              >
                <RenderShape shape={targetCard.shape} color={targetCard.color} size={64} />
                {targetCard.distractorText && (
                  <span
                    className="text-[10px] font-black tracking-widest mt-1 uppercase"
                    style={{ color: COLOR_MAP[targetCard.distractorColor!].hex }}
                  >
                    {targetCard.distractorText}
                  </span>
                )}
              </motion.div>
            </div>

            {/* 2 Choices */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer('left')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/90 border-2 border-slate-800 hover:border-purple-400 active:scale-95 transition-all shadow-lg"
              >
                <span className="text-[10px] font-bold text-slate-500 mb-1">[A] veya [←]</span>
                <RenderShape shape={options.left.shape} color={options.left.color} size={50} />
              </button>

              <button
                onClick={() => handleAnswer('right')}
                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/90 border-2 border-slate-800 hover:border-purple-400 active:scale-95 transition-all shadow-lg"
              >
                <span className="text-[10px] font-bold text-slate-500 mb-1">[D] veya [→]</span>
                <RenderShape shape={options.right.shape} color={options.right.color} size={50} />
              </button>
            </div>

            {/* Bottom Combo Bar */}
            <div className="flex items-center justify-between text-xs px-2 pt-1 text-slate-400">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Flame className="w-4 h-4 fill-amber-400/20" />
                <span>Seri: {streak}x (Çarpan: x{Math.min(4, Math.floor(streak / 3) + 1)})</span>
              </div>
              <div className="font-bold text-purple-300">
                Puan: {score}
              </div>
            </div>
          </div>
        )}

        {/* --- STATE 3: LEVEL CLEARED --- */}
        <AnimatePresence>
          {gameState === 'level_cleared' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4"
            >
              {/* Stars */}
              <div className="flex items-center gap-2 mb-1">
                {[1, 2, 3].map((starIdx) => (
                  <Star
                    key={`shift-star-${starIdx}`}
                    className={`w-10 sm:w-12 h-10 sm:h-12 ${
                      starsEarned >= starIdx
                        ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Seviye {level.levelNumber} Başarıldı!
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Tebrikler! Yüksek refleks ve kural geçişi gösterdiniz.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900 p-4 rounded-2xl border border-slate-800 w-full max-w-xs">
                <div>
                  <span className="text-slate-400 block">Kazanılan Altın:</span>
                  <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                    <Coins className="w-4 h-4" />
                    +{coinsEarned + 50}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Skor:</span>
                  <span className="text-lg font-black text-purple-400">{score}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full max-w-xs pt-2">
                <button
                  onClick={() => {
                    setGameState('countdown');
                    setCountdown(3);
                  }}
                  className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tekrar</span>
                </button>

                {level.levelNumber < SHIFT_LEVELS.length ? (
                  <button
                    onClick={handleNextLevel}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-purple-500/30 flex items-center justify-center gap-1.5"
                  >
                    <span>Sonraki Seviye</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-black text-xs"
                  >
                    <span>Tümü Bitti!</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {gameState === 'game_over' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white">Süre Doldu!</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Hedeflenen {level.targetCount} eşleşmeyi süre bitmeden tamamlayamadınız.
              </p>

              {/* Actionable Coach Deficit Tip Box */}
              <div className="w-full max-w-md bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Nöro-Koç Hız & Stroop Zorlanma Analizi:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {level.tip || 'Çeldirici kelimeler sol beyninizi yanıltır. Şeklin yalnızca kontur çizgisine odaklanın ve iç sesinizle rengi tekrar etmeyin.'}
                </p>
                <div className="text-[10px] text-amber-400/90 font-medium pt-1 border-t border-amber-500/20">
                  💡 Tavsiye: İlk 5 turda hız yerine doğruluğa odaklanarak kombo çarpanını yükseltin.
                </div>
              </div>

              <button
                onClick={() => {
                  setGameState('countdown');
                  setCountdown(3);
                }}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tekrar Dene</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
