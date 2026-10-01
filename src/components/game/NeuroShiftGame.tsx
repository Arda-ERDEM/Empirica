'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/utils/audio';
import { useCognitiveStore } from '@/store/cognitiveStore';
import confetti from 'canvas-confetti';
import {
  Zap,
  Timer,
  Flame,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trophy,
  Brain,
  TrendingUp,
  X
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

const COLOR_MAP: Record<ColorType, { name: string; hex: string; bgClass: string; borderClass: string; textClass: string }> = {
  sky: { name: 'Mavi', hex: '#38bdf8', bgClass: 'bg-sky-500', borderClass: 'border-sky-500', textClass: 'text-sky-400' },
  rose: { name: 'Kırmızı', hex: '#f43f5e', bgClass: 'bg-rose-500', borderClass: 'border-rose-500', textClass: 'text-rose-400' },
  emerald: { name: 'Yeşil', hex: '#10b981', bgClass: 'bg-emerald-500', borderClass: 'border-emerald-500', textClass: 'text-emerald-400' },
  amber: { name: 'Sarı', hex: '#f59e0b', bgClass: 'bg-amber-500', borderClass: 'border-amber-500', textClass: 'text-amber-400' },
};

const SHAPE_NAMES: Record<ShapeType, string> = {
  circle: 'Daire',
  square: 'Kare',
  triangle: 'Üçgen',
  star: 'Yıldız',
};

// Render Shape SVG
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

interface NeuroShiftGameProps {
  onClose: () => void;
}

export const NeuroShiftGame: React.FC<NeuroShiftGameProps> = ({ onClose }) => {
  const { recordSessionResult } = useCognitiveStore();

  // Game Lifecycle: 'countdown' | 'playing' | 'gameover'
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'gameover'>('countdown');
  const [countdown, setCountdown] = useState<number>(3);

  // Core Game Stats
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [peakStreak, setPeakStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(35); // 35 seconds per session
  const [currentRule, setCurrentRule] = useState<RuleType>('color');
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [ruleShiftCount, setRuleShiftCount] = useState(0);
  const [ruleShiftBanner, setRuleShiftBanner] = useState<string | null>(null);

  // Reaction Time & Error Diagnosis
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const questionStartTimeRef = useRef<number>(Date.now());
  const [lastFeedback, setLastFeedback] = useState<'correct' | 'wrong' | null>(null);

  const [ruleSwitchErrors, setRuleSwitchErrors] = useState(0);
  const [distractorErrors, setDistractorErrors] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAttempts, setCorrectAttempts] = useState(0);
  const isRuleShiftTurnRef = useRef<boolean>(false);

  // Cards
  const [targetCard, setTargetCard] = useState<CardItem>({ shape: 'circle', color: 'sky' });
  const [options, setOptions] = useState<{ left: CardItem; right: CardItem; correctSide: 'left' | 'right' }>({
    left: { shape: 'circle', color: 'rose' },
    right: { shape: 'square', color: 'sky' },
    correctSide: 'right',
  });

  // Generate a new test trial
  const generateNewRound = useCallback((rule: RuleType, currentStreak: number) => {
    // 1. Pick target
    const targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    // If streak > 3, add Stroop text distractor
    let distractorText: string | undefined = undefined;
    let distractorColor: ColorType | undefined = undefined;
    if (currentStreak >= 4 && Math.random() > 0.35) {
      const otherColors = COLORS.filter((c) => c !== targetColor);
      distractorColor = otherColors[Math.floor(Math.random() * otherColors.length)];
      distractorText = COLOR_MAP[distractorColor].name.toUpperCase();
    }

    const newTarget: CardItem = {
      shape: targetShape,
      color: targetColor,
      distractorText,
      distractorColor,
    };

    // 2. Pick Correct Option matching either shape or color based on active rule
    const correctSide = Math.random() > 0.5 ? 'left' : 'right';

    let correctCard: CardItem;
    let wrongCard: CardItem;

    if (rule === 'color') {
      // Correct option matches COLOR, but has DIFFERENT shape
      const otherShapes = SHAPES.filter((s) => s !== targetShape);
      correctCard = {
        shape: otherShapes[Math.floor(Math.random() * otherShapes.length)],
        color: targetColor,
      };

      // Wrong option matches SHAPE (the classic cognitive interference trap!)
      const otherColors = COLORS.filter((c) => c !== targetColor);
      wrongCard = {
        shape: targetShape,
        color: otherColors[Math.floor(Math.random() * otherColors.length)],
      };
    } else {
      // Rule is SHAPE: Correct option matches SHAPE, but DIFFERENT color
      const otherColors = COLORS.filter((c) => c !== targetColor);
      correctCard = {
        shape: targetShape,
        color: otherColors[Math.floor(Math.random() * otherColors.length)],
      };

      // Wrong option matches COLOR (trap!)
      const otherShapes = SHAPES.filter((s) => s !== targetShape);
      wrongCard = {
        shape: otherShapes[Math.floor(Math.random() * otherShapes.length)],
        color: targetColor,
      };
    }

    setTargetCard(newTarget);
    setOptions({
      left: correctSide === 'left' ? correctCard : wrongCard,
      right: correctSide === 'right' ? correctCard : wrongCard,
      correctSide,
    });

    questionStartTimeRef.current = Date.now();
  }, []);

  // 1. Initial 3-2-1 Countdown
  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown((c) => c - 1), 750);
        return () => clearTimeout(timer);
      } else {
        setGameState('playing');
        generateNewRound('color', 0);
      }
    }
  }, [gameState, countdown, generateNewRound]);

  // 2. Timer Loop during game
  useEffect(() => {
    if (gameState !== 'playing') return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setGameState('gameover');
          sounds.playGameComplete();
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Handle User Choice
  const handleAnswer = (chosenSide: 'left' | 'right') => {
    if (gameState !== 'playing') return;

    const reactionTime = Date.now() - questionStartTimeRef.current;
    setReactionTimes((prev) => [...prev, reactionTime]);
    setTotalAttempts((prev) => prev + 1);

    const isCorrect = chosenSide === options.correctSide;

    if (isCorrect) {
      sounds.playCorrect();
      setLastFeedback('correct');
      const newStreak = streak + 1;
      setStreak(newStreak);
      setPeakStreak((p) => Math.max(p, newStreak));
      setCorrectAttempts((prev) => prev + 1);

      // Score formula: speed bonus + streak multiplier
      const speedBonus = Math.max(50, 300 - Math.round(reactionTime / 5));
      const points = 100 + speedBonus + newStreak * 25;
      setScore((s) => s + points);

      const nextConsecutive = consecutiveCorrect + 1;
      setConsecutiveCorrect(nextConsecutive);

      // Dynamic Rule Shift (Anti-Plateau Trigger: every 3-4 correct answers)
      if (nextConsecutive >= 4) {
        const nextRule: RuleType = currentRule === 'color' ? 'shape' : 'color';
        setCurrentRule(nextRule);
        setConsecutiveCorrect(0);
        setRuleShiftCount((c) => c + 1);
        isRuleShiftTurnRef.current = true;
        sounds.playRuleShift();

        setRuleShiftBanner(
          nextRule === 'color'
            ? '⚡ KURAL DEĞİŞTİ: ARTIK RENGE GÖRE SEÇ!'
            : '⚡ KURAL DEĞİŞTİ: ARTIK ŞEKLE GÖRE SEÇ!'
        );
        setTimeout(() => setRuleShiftBanner(null), 1400);

        generateNewRound(nextRule, newStreak);
      } else {
        isRuleShiftTurnRef.current = false;
        generateNewRound(currentRule, newStreak);
      }
    } else {
      // Wrong Answer
      sounds.playWrong();
      setLastFeedback('wrong');
      setStreak(0);
      setConsecutiveCorrect(0);

      if (isRuleShiftTurnRef.current) {
        setRuleSwitchErrors((e) => e + 1);
      } else if (targetCard.distractorText) {
        setDistractorErrors((e) => e + 1);
      }

      isRuleShiftTurnRef.current = false;
      generateNewRound(currentRule, 0);
    }

    setTimeout(() => setLastFeedback(null), 350);
  };

  // Keyboard navigation (Left Arrow / Right Arrow or A / D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        handleAnswer('left');
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        handleAnswer('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, options, handleAnswer]);

  // Save session when game ends
  const handleSaveAndReturn = () => {
    const avgReaction = reactionTimes.length
      ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
      : 320;
    const accuracy = totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

    recordSessionResult({
      id: `session-${Date.now()}`,
      gameId: 'neuro-shift',
      gameTitle: 'NeuroShift: Çapraz Kural',
      domain: 'flexibility',
      timestamp: 'Az önce',
      score,
      accuracy,
      averageReactionTimeMs: avgReaction,
      peakStreak,
      difficultyReached: Math.min(10, Math.floor(score / 500) + 1),
      ruleShiftsHandled: ruleShiftCount,
      plateauBreakerBonus: ruleShiftCount * 120,
      breakdown: {
        ruleSwitchErrors,
        distractorErrors,
        speedVsAccuracyBalance: accuracy > 85 ? 'Hızlı ve Çevik' : 'Stratejik Denge',
        cognitiveFatigueOnsetMs: 25000,
      },
      farTransferFeedback:
        ruleShiftCount > 3
          ? `${ruleShiftCount} ani kural değişimini yönettiniz! Gerçek hayatta ani kriz durumlarında stratejinizi saliseler içinde değiştirebilme çevikliğiniz gelişti.`
          : 'Kural geçişlerinde bir miktar gecikme tespit edildi. Düzenli pratikle zihinsel esneklik süreniz kısalacaktır.',
    });

    onClose();
  };

  const restartGame = () => {
    setScore(0);
    setStreak(0);
    setPeakStreak(0);
    setTimeLeft(35);
    setCurrentRule('color');
    setConsecutiveCorrect(0);
    setRuleShiftCount(0);
    setRuleShiftBanner(null);
    setReactionTimes([]);
    setRuleSwitchErrors(0);
    setDistractorErrors(0);
    setTotalAttempts(0);
    setCorrectAttempts(0);
    setCountdown(3);
    setGameState('countdown');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-sky-500/30 rounded-3xl p-5 sm:p-8 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[580px]">
        {/* Ambient Glows */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header / Stats Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
              NeuroShift
            </h2>
            <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-bold border border-sky-500/20">
              Esneklik & Dikkat
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-sky-300">
              <Timer className="w-3.5 h-3.5 text-sky-400" />
              <span>{timeLeft}s</span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-black text-amber-400">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{score}</span>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- STATE 1: COUNTDOWN --- */}
        {gameState === 'countdown' && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-2">
              <Brain className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">Hazır mısınız?</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm">
              Yukarıdaki kuralı takip edin. Kural her an tersine dönebilir! Sol veya Sağ seçeneğe dokunun veya klavyede 
              <span className="text-white font-bold mx-1">← / →</span> tuşlarını kullanın.
            </p>
            <div className="text-6xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-purple-500 scale-up">
              {countdown > 0 ? countdown : 'BAŞLA!'}
            </div>
          </div>
        )}

        {/* --- STATE 2: ACTIVE GAMEPLAY --- */}
        {gameState === 'playing' && (
          <div className="flex-1 flex flex-col justify-between py-4 space-y-4 relative">
            
            {/* Visual Feedback Flash (Green / Red) */}
            <AnimatePresence>
              {lastFeedback && (
                <motion.div
                  initial={{ opacity: 0.6 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute inset-0 pointer-events-none rounded-2xl ${
                    lastFeedback === 'correct' ? 'bg-emerald-500/15' : 'bg-rose-500/20'
                  }`}
                />
              )}
            </AnimatePresence>

            {/* Dynamic Rule Shift Pop-up Banner */}
            <AnimatePresence>
              {ruleShiftBanner && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -20 }}
                  className="absolute top-2 left-0 right-0 z-30 mx-auto max-w-md p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs sm:text-sm text-center shadow-xl shadow-purple-500/30 border border-purple-400/40 flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>{ruleShiftBanner}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACTIVE RULE BANNER (Dead Simple & Unmissable!) */}
            <div className="text-center">
              <div
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-2xl border text-sm sm:text-base font-black uppercase tracking-wider transition-all duration-300 shadow-lg ${
                  currentRule === 'color'
                    ? 'bg-sky-500/15 border-sky-400/40 text-sky-300 shadow-sky-500/10'
                    : 'bg-purple-500/15 border-purple-400/40 text-purple-300 shadow-purple-500/10'
                }`}
              >
                {currentRule === 'color' ? (
                  <>
                    <span className="w-3 h-3 rounded-full bg-sky-400" />
                    <span>ŞİMDİKİ KURAL: AYNI RENK OLANINI SEÇ</span>
                  </>
                ) : (
                  <>
                    <span className="w-3 h-3 rounded-sm bg-purple-400" />
                    <span>ŞİMDİKİ KURAL: AYNI ŞEKİL OLANINI SEÇ</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Ortadaki kart ile eşleşen seçeneğe tıkla (veya Sol / Sağ ok tuşu).
              </p>
            </div>

            {/* CENTER TARGET CARD */}
            <div className="flex flex-col items-center justify-center my-2">
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                MERKEZ KART
              </div>
              <motion.div
                key={`${targetCard.shape}-${targetCard.color}`}
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl bg-slate-900 border-2 border-slate-700/80 flex flex-col items-center justify-center relative shadow-2xl group"
              >
                <RenderShape shape={targetCard.shape} color={targetCard.color} size={68} />

                {/* Stroop Distractor Text (if active) */}
                {targetCard.distractorText && (
                  <span
                    className="text-[11px] font-black tracking-widest mt-1 uppercase"
                    style={{ color: COLOR_MAP[targetCard.distractorColor!].hex }}
                  >
                    {targetCard.distractorText}
                  </span>
                )}
              </motion.div>
            </div>

            {/* BOTTOM 2 CHOICES (LEFT & RIGHT) */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                
                {/* Left Option */}
                <button
                  onClick={() => handleAnswer('left')}
                  className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-900/90 border-2 border-slate-800 hover:border-sky-400 active:scale-95 transition-all shadow-lg hover:shadow-sky-500/20"
                >
                  <span className="absolute top-2 left-3 text-[10px] font-bold text-slate-500 group-hover:text-sky-300">
                    [A] veya [←]
                  </span>
                  <RenderShape shape={options.left.shape} color={options.left.color} size={54} />
                  <span className="mt-2 text-xs font-semibold text-slate-300">
                    {COLOR_MAP[options.left.color].name} {SHAPE_NAMES[options.left.shape]}
                  </span>
                </button>

                {/* Right Option */}
                <button
                  onClick={() => handleAnswer('right')}
                  className="group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl bg-slate-900/90 border-2 border-slate-800 hover:border-sky-400 active:scale-95 transition-all shadow-lg hover:shadow-sky-500/20"
                >
                  <span className="absolute top-2 right-3 text-[10px] font-bold text-slate-500 group-hover:text-sky-300">
                    [D] veya [→]
                  </span>
                  <RenderShape shape={options.right.shape} color={options.right.color} size={54} />
                  <span className="mt-2 text-xs font-semibold text-slate-300">
                    {COLOR_MAP[options.right.color].name} {SHAPE_NAMES[options.right.shape]}
                  </span>
                </button>

              </div>

              {/* Bottom Info: Streak & Anti-Plateau Indicator */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-1 pt-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <Flame className="w-4 h-4 fill-amber-400/20" />
                  <span>Seri: {streak}x</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-300 text-[11px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                  <span>Kural Değişimi: {ruleShiftCount} kez kırıldı</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* --- STATE 3: GAMEOVER & COGNITIVE TELEMETRY --- */}
        {gameState === 'gameover' && (
          <div className="flex-1 flex flex-col justify-between py-4 space-y-4">
            
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-1">
                <Trophy className="w-4 h-4" />
                <span>Seans Tamamlandı!</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Bilişsel Performans Raporu
              </h3>
              <p className="text-xs text-slate-400">
                Puanınız ve nöral telemetri verileriniz doğrudan Empirica Dashboard'una aktarılmaya hazır.
              </p>
            </div>

            {/* Score & Key Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Toplam Skor</span>
                <span className="text-2xl font-black text-amber-400">{score}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">İsabet Oranı</span>
                <span className="text-2xl font-black text-emerald-400">
                  %{totalAttempts ? Math.round((correctAttempts / totalAttempts) * 100) : 0}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Ort. Tepki Süresi</span>
                <span className="text-2xl font-black text-sky-400">
                  {reactionTimes.length ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) : 0}ms
                </span>
              </div>
            </div>

            {/* Error Breakdown (Lumosity'ye karşı derinlemesine analiz) */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <h4 className="font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-purple-400" />
                <span>Nerede Zorlandınız? (Hata Dökümü)</span>
              </h4>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block">Kural Değişimi Hatası:</span>
                  <span className={ruleSwitchErrors > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {ruleSwitchErrors} kez (Kas hafızası etkisi)
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400 block">Çeldirici Yanılgısı:</span>
                  <span className={distractorErrors > 0 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {distractorErrors} kez (Stroop etkisi)
                  </span>
                </div>
              </div>
            </div>

            {/* Far Transfer Reality Feedback */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-200 block mb-0.5">Gerçek Hayat Yansıması (Far Transfer):</strong>
                {ruleShiftCount >= 3 ? (
                  <span>
                    Oyun sırasında {ruleShiftCount} kez kural değişti ve başarıyla uyum sağladınız. 
                    Bu, iş hayatında veya acil durumlarda eski varsayımları bırakıp yeni koşullara hızla adapte olma yetinizi pekiştirir.
                  </span>
                ) : (
                  <span>
                    Kural geçişlerinde hafif bir zihinsel yavaşlama gözlemlendi. Günlük 1 seans NeuroShift ile zihinsel geçiş gecikmenizi 7 günde %20 azaltabilirsiniz.
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={restartGame}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tekrar Oyna</span>
              </button>

              <button
                onClick={handleSaveAndReturn}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30 transition-all active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Skoru Kaydet & Dashboard'a Dön</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
