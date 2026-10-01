'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { sounds } from '@/utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  Layers,
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
} from 'lucide-react';

interface DualTaskGameProps {
  onClose: () => void;
  onOpenLevelSelect?: () => void;
}

interface Stimulus {
  position: number; // 0 - 8 (3x3 grid)
  letter: string;   // 'A', 'C', 'K', 'L', 'T', 'X'
}

const LETTERS = ['A', 'B', 'K', 'M', 'T', 'X'];

export const DualTaskGame: React.FC<DualTaskGameProps> = ({
  onClose,
  onOpenLevelSelect,
}) => {
  const {
    selectedDualLevel,
    selectDualLevel,
    completeDualLevel,
  } = useGameStore();

  // N-Back config (Level 1-10 is 1-Back, Level 11-20 is 2-Back)
  const nBack = selectedDualLevel >= 11 ? 2 : 1;
  const totalTrials = 15;
  const stimulusDurationMs = Math.max(1300, 2200 - selectedDualLevel * 45);

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'level_won' | 'game_over'>('ready');
  const [trialIndex, setTrialIndex] = useState(0);
  const [history, setHistory] = useState<Stimulus[]>([]);
  const [currentStimulus, setCurrentStimulus] = useState<Stimulus | null>(null);

  // Response tracking for current trial
  const [respondedPosition, setRespondedPosition] = useState(false);
  const [respondedLetter, setRespondedLetter] = useState(false);

  // Stats
  const [correctHits, setCorrectHits] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [totalOpportunities, setTotalOpportunities] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start sequence
  const startNextStimulus = useCallback((currentHist: Stimulus[], nextIdx: number) => {
    if (nextIdx >= totalTrials) {
      // Completed!
      finishGame();
      return;
    }

    // Determine whether to force a match (30% chance for position, 30% for letter)
    let pos = Math.floor(Math.random() * 9);
    let ltr = LETTERS[Math.floor(Math.random() * LETTERS.length)];

    if (currentHist.length >= nBack) {
      const matchCandidate = currentHist[currentHist.length - nBack];
      if (Math.random() < 0.35) {
        pos = matchCandidate.position;
      }
      if (Math.random() < 0.35) {
        ltr = matchCandidate.letter;
      }
    }

    const newStim: Stimulus = { position: pos, letter: ltr };
    const updatedHist = [...currentHist, newStim];

    setCurrentStimulus(newStim);
    setHistory(updatedHist);
    setTrialIndex(nextIdx);
    setRespondedPosition(false);
    setRespondedLetter(false);

    // Audio cue
    sounds.playClick();

    // Check opportunities
    if (updatedHist.length > nBack) {
      const targetPast = updatedHist[updatedHist.length - 1 - nBack];
      if (targetPast.position === newStim.position || targetPast.letter === newStim.letter) {
        setTotalOpportunities((prev) => prev + 1);
      }
    }

    // Schedule next
    timerRef.current = setTimeout(() => {
      startNextStimulus(updatedHist, nextIdx + 1);
    }, stimulusDurationMs);
  }, [nBack, stimulusDurationMs]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const startGame = () => {
    setGameState('playing');
    setTrialIndex(0);
    setHistory([]);
    setCorrectHits(0);
    setFalseAlarms(0);
    setTotalOpportunities(0);
    startNextStimulus([], 0);
  };

  const finishGame = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    sounds.playLevelComplete();
    setGameState('level_won');

    const accuracy = totalOpportunities > 0 ? Math.min(100, Math.round((correctHits / Math.max(1, totalOpportunities)) * 100)) : 80;
    const stars = accuracy >= 75 ? 3 : accuracy >= 50 ? 2 : 1;
    const finalScore = correctHits * 150 - falseAlarms * 40;
    const coins = 25 + stars * 5;

    completeDualLevel(selectedDualLevel, stars, Math.max(100, finalScore), coins);

    try {
      confetti({ particleCount: 70, spread: 65, origin: { y: 0.6 } });
    } catch {}
  };

  // Button handlers
  const handlePositionMatch = () => {
    if (!currentStimulus || respondedPosition || history.length <= nBack) return;
    setRespondedPosition(true);

    const past = history[history.length - 1 - nBack];
    if (past && past.position === currentStimulus.position) {
      sounds.playSuccess();
      setCorrectHits((c) => c + 1);
    } else {
      sounds.playError();
      setFalseAlarms((f) => f + 1);
    }
  };

  const handleLetterMatch = () => {
    if (!currentStimulus || respondedLetter || history.length <= nBack) return;
    setRespondedLetter(true);

    const past = history[history.length - 1 - nBack];
    if (past && past.letter === currentStimulus.letter) {
      sounds.playSuccess();
      setCorrectHits((c) => c + 1);
    } else {
      sounds.playError();
      setFalseAlarms((f) => f + 1);
    }
  };

  const restartLevel = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startGame();
  };

  const nextLevel = () => {
    if (selectedDualLevel < 20) {
      selectDualLevel(selectedDualLevel + 1);
      setGameState('ready');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-xl">
      <div className="relative w-full max-w-xl bg-slate-950 border border-rose-500/40 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-white">Dual Task: İkili Görev</span>
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30">
                  Seviye {selectedDualLevel} / 20 ({nBack}-Geri Modu)
                </span>
              </div>
              <span className="text-xs text-slate-400">Çift Görev & Bölünmüş Dikkat (Dual N-Back)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLevelSelect && (
              <button
                onClick={onOpenLevelSelect}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-400 text-slate-300 transition-colors"
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

        {/* Progress & Stats */}
        <div className="grid grid-cols-3 gap-2 py-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Aşama</span>
            <span className="text-sm font-black text-white">
              {trialIndex + 1} / {totalTrials}
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">İsabet</span>
            <span className="text-sm font-black text-emerald-400">
              {correctHits} Doğru
            </span>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2.5 text-center">
            <span className="text-[10px] text-slate-400 font-semibold block uppercase">Yanlış Alarm</span>
            <span className="text-sm font-black text-rose-400">
              {falseAlarms}
            </span>
          </div>
        </div>

        {/* Game instructions alert */}
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-200 text-center">
          {nBack === 1 ? (
            <span>⚡ Mevcut konum veya harf <b>1 adım öncekiyle</b> aynıysa ilgili butona bas!</span>
          ) : (
            <span>⚡ Mevcut konum veya harf <b>2 adım öncekiyle</b> aynıysa ilgili butona bas!</span>
          )}
        </div>

        {/* 3x3 Position Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 space-y-4">
          {gameState === 'ready' ? (
            <div className="text-center space-y-4 py-8">
              <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto">
                <Layers className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white">Bilişsel Esneklik Antrenmanı</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                  Ekranda beliren uyaranların hem konumunu hem de harfini takip edin.
                </p>
              </div>
              <button
                onClick={startGame}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-black text-sm shadow-lg shadow-rose-500/30 active:scale-95 transition-all"
              >
                Başla
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3 p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-inner w-full max-w-xs aspect-square">
                {Array.from({ length: 9 }).map((_, idx) => {
                  const isActive = currentStimulus?.position === idx;

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl flex items-center justify-center font-black text-2xl transition-all duration-200 aspect-square select-none ${
                        isActive
                          ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white border-2 border-white shadow-lg shadow-rose-500/50 scale-105'
                          : 'bg-slate-800/60 border border-slate-700/50 text-transparent'
                      }`}
                    >
                      {isActive ? currentStimulus?.letter : ''}
                    </div>
                  );
                })}
              </div>

              {/* 2 Dual Match Action Buttons */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-xs pt-2">
                <button
                  disabled={respondedPosition}
                  onClick={handlePositionMatch}
                  className={`py-3 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 border shadow-md ${
                    respondedPosition
                      ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-rose-500/20 hover:bg-rose-500/30 border-rose-500/40 text-rose-300 active:scale-95'
                  }`}
                >
                  <span>📍 Konum Eşleşti</span>
                </button>

                <button
                  disabled={respondedLetter}
                  onClick={handleLetterMatch}
                  className={`py-3 px-3 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-1.5 border shadow-md ${
                    respondedLetter
                      ? 'bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/40 text-purple-300 active:scale-95'
                  }`}
                >
                  <span>🔤 Harf Eşleşti</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Win / Complete Overlay */}
        <AnimatePresence>
          {gameState === 'level_won' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/95 backdrop-blur-md rounded-3xl p-6 flex flex-col items-center justify-center text-center space-y-4 z-20"
            >
              <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-xl shadow-rose-500/20">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Çift Görev Başarılı!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  İşleyen belleğini ve bölünmüş dikkatini üst seviyede tuttun.
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
                <span className="text-amber-400">+{30} 🪙 Altın</span>
                <span className="text-slate-400">|</span>
                <span className="text-rose-400">{correctHits * 150} Puan</span>
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
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30"
                >
                  <span>Sonraki Seviye</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
