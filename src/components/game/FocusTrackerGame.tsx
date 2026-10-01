'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { sounds } from '@/utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Target,
  X,
  RotateCcw,
  Grid,
  Trophy,
  Coins,
  Star,
  CheckCircle,
  AlertCircle,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
} from 'lucide-react';

interface FocusTrackerGameProps {
  onClose: () => void;
  onOpenLevelSelect?: () => void;
}

interface ShapeItem {
  id: number;
  shape: 'circle' | 'square' | 'triangle' | 'star' | 'diamond';
  color: 'amber' | 'emerald' | 'sky' | 'purple' | 'rose';
  isTarget: boolean;
}

const SHAPES = ['circle', 'square', 'triangle', 'star', 'diamond'] as const;
const COLORS = ['amber', 'emerald', 'sky', 'purple', 'rose'] as const;

export const FocusTrackerGame: React.FC<FocusTrackerGameProps> = ({
  onClose,
  onOpenLevelSelect,
}) => {
  const {
    selectedFocusLevel,
    selectFocusLevel,
    completeFocusLevel,
  } = useGameStore();

  // Level configuration generator (1-20)
  const getLevelConfig = (lvl: number) => {
    const totalItems = Math.min(16, 8 + Math.floor(lvl / 3) * 2); // 8 to 16 items
    const requiredHits = 5 + Math.min(15, lvl); // 6 to 20 hits
    const initialTimeSec = Math.max(16, 25 - Math.floor(lvl / 2)); // 25s down to 16s
    return { totalItems, requiredHits, initialTimeSec };
  };

  const config = getLevelConfig(selectedFocusLevel);

  const [gameState, setGameState] = useState<'playing' | 'level_won' | 'game_over'>('playing');
  const [hits, setHits] = useState(0);
  const [combo, setCombo] = useState(1);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(config.initialTimeSec);
  const [currentTarget, setCurrentTarget] = useState<{
    shape: typeof SHAPES[number];
    color: typeof COLORS[number];
    title: string;
  }>({ shape: 'star', color: 'amber', title: 'Sarı Yıldız' });

  const [items, setItems] = useState<ShapeItem[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate target prompt and items
  const generateBoard = useCallback(() => {
    const targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    const colorNames: Record<string, string> = {
      amber: 'Sarı / Turuncu',
      emerald: 'Yeşil',
      sky: 'Açık Mavi',
      purple: 'Mor',
      rose: 'Kırmızı',
    };

    const shapeNames: Record<string, string> = {
      circle: 'Daire',
      square: 'Kare',
      triangle: 'Üçgen',
      star: 'Yıldız',
      diamond: 'Baklava',
    };

    setCurrentTarget({
      shape: targetShape,
      color: targetColor,
      title: `${colorNames[targetColor]} ${shapeNames[targetShape]}`,
    });

    // 1 Guaranteed Target + Distractors
    const newItems: ShapeItem[] = [];
    const targetPos = Math.floor(Math.random() * config.totalItems);

    for (let i = 0; i < config.totalItems; i++) {
      if (i === targetPos) {
        newItems.push({
          id: i,
          shape: targetShape,
          color: targetColor,
          isTarget: true,
        });
      } else {
        let randShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        let randColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        // Ensure not identical to target
        if (randShape === targetShape && randColor === targetColor) {
          randShape = targetShape === 'circle' ? 'square' : 'circle';
        }
        newItems.push({
          id: i,
          shape: randShape,
          color: randColor,
          isTarget: false,
        });
      }
    }

    setItems(newItems);
  }, [config.totalItems]);

  // Restart / Initial mount
  useEffect(() => {
    setHits(0);
    setCombo(1);
    setScore(0);
    setTimeLeft(config.initialTimeSec);
    setGameState('playing');
    generateBoard();
  }, [selectedFocusLevel, config.initialTimeSec, generateBoard]);

  // Timer countdown
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

  // Handle click on item
  const handleItemClick = (item: ShapeItem) => {
    if (gameState !== 'playing') return;

    if (item.isTarget) {
      // Success!
      sounds.playSuccess();
      const points = 100 * combo;
      setScore((s) => s + points);
      const newHits = hits + 1;
      setHits(newHits);
      setCombo((c) => Math.min(5, c + 1));

      if (newHits >= config.requiredHits) {
        handleWin();
      } else {
        generateBoard();
      }
    } else {
      // Miss / Distractor
      sounds.playError();
      setCombo(1);
      setScore((s) => Math.max(0, s - 50));
      // Slight time penalty
      setTimeLeft((t) => Math.max(1, t - 2));
    }
  };

  const handleWin = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sounds.playLevelComplete();
    setGameState('level_won');

    const stars = timeLeft > config.initialTimeSec * 0.5 ? 3 : timeLeft > 5 ? 2 : 1;
    const finalScore = score + timeLeft * 50;
    const coins = 20 + stars * 5;

    completeFocusLevel(selectedFocusLevel, stars, finalScore, coins);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {}
  };

  const restartLevel = () => {
    setHits(0);
    setCombo(1);
    setScore(0);
    setTimeLeft(config.initialTimeSec);
    setGameState('playing');
    generateBoard();
  };

  const nextLevel = () => {
    if (selectedFocusLevel < 20) {
      selectFocusLevel(selectedFocusLevel + 1);
    } else {
      onClose();
    }
  };

  const renderShapeIcon = (shape: string, color: string) => {
    const colorClasses: Record<string, string> = {
      amber: 'text-amber-400 fill-amber-400/20',
      emerald: 'text-emerald-400 fill-emerald-400/20',
      sky: 'text-sky-400 fill-sky-400/20',
      purple: 'text-purple-400 fill-purple-400/20',
      rose: 'text-rose-400 fill-rose-400/20',
    };

    const cls = `w-7 h-7 sm:w-8 sm:h-8 ${colorClasses[color] || 'text-white'}`;

    switch (shape) {
      case 'circle':
        return <div className={`w-6 h-6 rounded-full border-4 border-current ${colorClasses[color]}`} />;
      case 'square':
        return <div className={`w-6 h-6 rounded-md border-4 border-current ${colorClasses[color]}`} />;
      case 'triangle':
        return (
          <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[20px] border-b-current" />
        );
      case 'star':
        return <Star className={cls} />;
      case 'diamond':
        return <div className={`w-5 h-5 rotate-45 border-4 border-current ${colorClasses[color]}`} />;
      default:
        return <Target className={cls} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl">
      <div className="relative w-full max-w-xl bg-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">Focus Flash: Hedef Avcısı</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30">
                  Seviye {selectedFocusLevel} / 20
                </span>
              </div>
              <span className="text-xs text-slate-400">Görsel Dikkat & Hızlı Ayırt Etme</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLevelSelect && (
              <button
                onClick={onOpenLevelSelect}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 text-slate-300 transition-colors"
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
          {/* Time */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Süre</span>
            <span className={`text-sm font-black ${timeLeft <= 5 ? 'text-red-400 animate-ping' : 'text-amber-400'}`}>
              {timeLeft}s
            </span>
          </div>

          {/* Hits */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Hedef</span>
            <span className="text-sm font-black text-sky-400">
              {hits} / {config.requiredHits}
            </span>
          </div>

          {/* Combo */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Kombo</span>
            <span className="text-sm font-black text-purple-400">
              {combo}x
            </span>
          </div>

          {/* Score */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Skor</span>
            <span className="text-sm font-black text-emerald-400">
              {score}
            </span>
          </div>
        </div>

        {/* Dynamic Target Rule Box */}
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-3 flex items-center justify-between shadow-lg shadow-amber-500/10">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">HEDEF:</span>
            <span className="text-sm font-black text-white">{currentTarget.title}</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-amber-500/30 flex items-center justify-center">
            {renderShapeIcon(currentTarget.shape, currentTarget.color)}
          </div>
        </div>

        {/* Board of items */}
        <div className="flex-1 flex items-center justify-center p-3">
          <div
            className="grid grid-cols-4 gap-3 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-inner w-full max-w-sm aspect-square"
          >
            {items.map((item) => (
              <motion.button
                key={item.id}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => handleItemClick(item)}
                className="rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-400 flex items-center justify-center transition-all p-3 aspect-square shadow-sm active:bg-slate-700"
              >
                {renderShapeIcon(item.shape, item.color)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {gameState === 'level_won' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 z-20"
            >
              <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/20">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Harika Odak!</h3>
                <p className="text-xs text-slate-400 mt-1">Tüm hedefleri zamanında ayırt ettin.</p>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-7 h-7 ${
                      star <= (timeLeft > config.initialTimeSec * 0.5 ? 3 : 2)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl text-xs font-bold">
                <span className="text-amber-400">+{25} 🪙 Altın</span>
                <span className="text-slate-400">|</span>
                <span className="text-sky-400">{score + timeLeft * 50} Puan</span>
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
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
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
                <h3 className="text-2xl font-black text-white">Süre Doldu!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Dikkatini topla ve çeldiricilere aldanmadan yeniden dene.
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
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25"
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
