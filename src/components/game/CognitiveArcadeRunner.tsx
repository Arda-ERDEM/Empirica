'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore, GameId } from '@/store/gameStore';
import { sounds } from '@/utils/soundEffects';
import confetti from 'canvas-confetti';
import {
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
  Flame,
  Activity,
  Shuffle,
  Eye,
  Radio,
  Binary,
  Compass,
  Layers,
  Scale,
  GitBranch,
} from 'lucide-react';

interface CognitiveArcadeRunnerProps {
  gameId: GameId;
  gameTitle: string;
  gameBadge: string;
  gameColor: string;
  onClose: () => void;
  onOpenLevelSelect?: () => void;
}

export const CognitiveArcadeRunner: React.FC<CognitiveArcadeRunnerProps> = ({
  gameId,
  gameTitle,
  gameBadge,
  gameColor,
  onClose,
  onOpenLevelSelect,
}) => {
  const {
    getSelectedLevel,
    selectGameLevel,
    completeGameLevel,
  } = useGameStore();

  const level = getSelectedLevel(gameId);

  // Common Game State
  const [gameState, setGameState] = useState<'playing' | 'level_won' | 'game_over'>('playing');
  const [score, setScore] = useState(0);
  const [trial, setTrial] = useState(1);
  const [combo, setCombo] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(25);

  const totalTrials = 8;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Specific Game Local States ---
  // 1. Color Rush
  const [colorRushPrompt, setColorRushPrompt] = useState<{
    word: string;
    inkClass: string;
    mode: 'word' | 'ink';
    answer: string;
  }>({ word: 'MAVİ', inkClass: 'text-red-500', mode: 'ink', answer: 'Kırmızı' });

  // 2. Sequence (Simon Says)
  const [simonSeq, setSimonSeq] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [isShowingSequence, setIsShowingSequence] = useState(false);

  // 3. Subitizing (Flash counting)
  const [dotCount, setDotCount] = useState(5);
  const [showDots, setShowDots] = useState(true);
  const [subitizingOptions, setSubitizingOptions] = useState<number[]>([]);

  // 4. Chrono Tap
  const [needlePos, setNeedlePos] = useState(0);
  const [needleDir, setNeedleDir] = useState(1);
  const targetWindow = Math.max(12, 30 - level); // Green window size %

  // 5. Traffic Control
  const [trafficArrow, setTrafficArrow] = useState<{
    dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    isInverse: boolean;
  }>({ dir: 'UP', isInverse: false });

  // 6. Switch Task
  const [switchItem, setSwitchItem] = useState<{
    letter: string;
    digit: number;
    mode: 'color-letter' | 'color-number';
  }>({ letter: 'A', digit: 4, mode: 'color-number' });

  // 7. Radar Tracking
  const [radarTargets, setRadarTargets] = useState<number[]>([0, 2]);
  const [revealedRadar, setRevealedRadar] = useState(true);
  const [selectedRadar, setSelectedRadar] = useState<number[]>([]);

  // 8. Circuit Flow
  const [circuitRotations, setCircuitRotations] = useState<number[]>([0, 90, 180, 270]);

  // 9. Syllogism
  const [syllogismQuestion, setSyllogismQuestion] = useState<{
    premise: string;
    isTrue: boolean;
  }>({ premise: 'Tüm A\'lar B ise ve tüm B\'ler C ise, tüm A\'lar C\'dir.', isTrue: true });

  // 10. Tower of Hanoi
  const [pegs, setPegs] = useState<number[][]>([[3, 2, 1], [], []]);
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null);

  // 11. Spatial Rotation
  const [spatialMatch, setSpatialMatch] = useState<{ angle: number; isSame: boolean }>({
    angle: 90,
    isSame: true,
  });

  // 12. Word Pairs
  const [wordPairData, setWordPairData] = useState<{
    prompt: string;
    answer: string;
    options: string[];
    isMemorizePhase: boolean;
  }>({ prompt: '', answer: '', options: [], isMemorizePhase: true });

  // 13. Peripheral Vision
  const [peripheralBlip, setPeripheralBlip] = useState<{ x: number; y: number } | null>(null);

  // 14. Magnitude Estimate
  const [magnitudeData, setMagnitudeData] = useState<{
    leftVal: string;
    rightVal: string;
    isLeftBigger: boolean;
  }>({ leftVal: '3/4', rightVal: '5/8', isLeftBigger: true });

  // --- GENERATOR LOGIC ---
  const generateNewTrial = useCallback(() => {
    // 1. Color Rush
    if (gameId === 'color-rush') {
      const colors = [
        { name: 'Kırmızı', cls: 'text-red-500' },
        { name: 'Mavi', cls: 'text-blue-400' },
        { name: 'Yeşil', cls: 'text-emerald-400' },
        { name: 'Sarı', cls: 'text-yellow-400' },
      ];
      const wordObj = colors[Math.floor(Math.random() * colors.length)];
      const inkObj = colors[Math.floor(Math.random() * colors.length)];
      const mode = Math.random() > 0.5 ? 'ink' : 'word';
      const answer = mode === 'ink' ? inkObj.name : wordObj.name;
      setColorRushPrompt({ word: wordObj.name, inkClass: inkObj.cls, mode, answer });
    }

    // 2. Sequence
    if (gameId === 'sequence') {
      const len = Math.min(7, 3 + Math.floor(level / 4));
      const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4));
      setSimonSeq(seq);
      setPlayerSeq([]);
      setIsShowingSequence(true);

      // Play sequence display
      seq.forEach((padIdx, i) => {
        setTimeout(() => {
          setActivePad(padIdx);
          sounds.playClick();
          setTimeout(() => setActivePad(null), 300);
          if (i === seq.length - 1) {
            setTimeout(() => setIsShowingSequence(false), 400);
          }
        }, (i + 1) * 600);
      });
    }

    // 3. Subitizing
    if (gameId === 'subitizing') {
      const count = Math.floor(Math.random() * 6) + 3 + Math.floor(level / 5);
      setDotCount(count);
      setShowDots(true);
      const opts = new Set<number>([count]);
      while (opts.size < 4) {
        const offset = (Math.floor(Math.random() * 3) + 1) * (Math.random() > 0.5 ? 1 : -1);
        if (count + offset > 0) opts.add(count + offset);
      }
      setSubitizingOptions(Array.from(opts).sort(() => Math.random() - 0.5));
      setTimeout(() => setShowDots(false), Math.max(350, 750 - level * 20));
    }

    // 4. Traffic Control
    if (gameId === 'traffic') {
      const dirs: ('UP' | 'DOWN' | 'LEFT' | 'RIGHT')[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
      setTrafficArrow({
        dir: dirs[Math.floor(Math.random() * dirs.length)],
        isInverse: Math.random() > 0.5,
      });
    }

    // 5. Switch Task
    if (gameId === 'switch-task') {
      const letters = ['A', 'E', 'B', 'K', 'T', 'O'];
      const digits = [2, 3, 4, 5, 6, 7, 8, 9];
      setSwitchItem({
        letter: letters[Math.floor(Math.random() * letters.length)],
        digit: digits[Math.floor(Math.random() * digits.length)],
        mode: Math.random() > 0.5 ? 'color-number' : 'color-letter',
      });
    }

    // 6. Radar Tracking
    if (gameId === 'radar') {
      const targetCount = Math.min(4, 2 + Math.floor(level / 6));
      const targets: number[] = [];
      while (targets.length < targetCount) {
        const r = Math.floor(Math.random() * 8);
        if (!targets.includes(r)) targets.push(r);
      }
      setRadarTargets(targets);
      setSelectedRadar([]);
      setRevealedRadar(true);
      setTimeout(() => setRevealedRadar(false), 2000);
    }

    // 7. Syllogism
    if (gameId === 'syllogism') {
      const syllogisms = [
        { premise: 'Tüm kediler hayvandır. Tekir bir kedidir. -> Tekir bir hayvandır.', isTrue: true },
        { premise: 'Tüm elmalar meyvedir. Bazı meyveler tatlıdır. -> Tüm elmalar tatlıdır.', isTrue: false },
        { premise: 'A, B\'den büyüktür. B, C\'den büyüktür. -> A, C\'den büyüktür.', isTrue: true },
        { premise: 'Hiçbir balık uçamaz. Bazı kuşlar balıktır. -> Tüm kuşlar uçar.', isTrue: false },
        { premise: 'Tüm metaller iletkendir. Bakır bir metaldir. -> Bakır iletkendir.', isTrue: true },
      ];
      setSyllogismQuestion(syllogisms[Math.floor(Math.random() * syllogisms.length)]);
    }

    // 8. Spatial 3D
    if (gameId === 'spatial') {
      const isSame = Math.random() > 0.5;
      const angle = [90, 180, 270][Math.floor(Math.random() * 3)];
      setSpatialMatch({ angle, isSame });
    }

    // 9. Word Pairs
    if (gameId === 'word-pair') {
      const pairs = [
        { p: 'Güneş', a: 'Işık' },
        { p: 'Deniz', a: 'Dalgakıran' },
        { p: 'Pusula', a: 'Kuzey' },
        { p: 'Ateş', a: 'Kıvılcım' },
        { p: 'Rüzgâr', a: 'Yelken' },
      ];
      const selected = pairs[Math.floor(Math.random() * pairs.length)];
      const falseOpts = pairs.filter((x) => x.a !== selected.a).map((x) => x.a).slice(0, 3);
      setWordPairData({
        prompt: selected.p,
        answer: selected.a,
        options: [...falseOpts, selected.a].sort(() => Math.random() - 0.5),
        isMemorizePhase: true,
      });
      setTimeout(() => {
        setWordPairData((prev) => ({ ...prev, isMemorizePhase: false }));
      }, 1800);
    }

    // 10. Magnitude
    if (gameId === 'estimate') {
      const pairs = [
        { l: '3/4 (%75)', r: '5/8 (%62.5)', isLeft: true },
        { l: '2/5 (%40)', r: '1/2 (%50)', isLeft: false },
        { l: '4/7 (%57)', r: '3/5 (%60)', isLeft: false },
        { l: '7/9 (%77)', r: '2/3 (%66)', isLeft: true },
        { l: '80 sayısının %30\'u (24)', r: '50 sayısının %40\'ı (20)', isLeft: true },
      ];
      const chosen = pairs[Math.floor(Math.random() * pairs.length)];
      setMagnitudeData({ leftVal: chosen.l, rightVal: chosen.r, isLeftBigger: chosen.isLeft });
    }

    // 11. Circuit Flow
    if (gameId === 'circuit') {
      const angles = [0, 1, 2, 3].map(() => [90, 270][Math.floor(Math.random() * 2)]);
      setCircuitRotations(angles);
    }

    // 12. Tower of Hanoi
    if (gameId === 'tower') {
      const diskCount = Math.min(3, 2 + Math.floor(level / 10)); // 2 or 3 disks
      const startPeg = Array.from({ length: diskCount }, (_, i) => diskCount - i);
      setPegs([startPeg, [], []]);
      setSelectedPeg(null);
    }

    // 13. Peripheral Vision
    if (gameId === 'peripheral') {
      setPeripheralBlip(null);
      const quad = Math.floor(Math.random() * 4); // 0: TL, 1: TR, 2: BL, 3: BR
      const delay = Math.floor(Math.random() * 400) + 400;
      setTimeout(() => {
        setPeripheralBlip({ x: quad % 2 === 0 ? 20 : 80, y: quad < 2 ? 20 : 80 });
      }, delay);
    }
  }, [gameId, level]);

  // Initial load
  useEffect(() => {
    setGameState('playing');
    setScore(0);
    setTrial(1);
    setCombo(1);
    setLives(3);
    setTimeLeft(25);
    generateNewTrial();
  }, [level, generateNewTrial]);

  // Needle oscillation for Chrono Tap
  useEffect(() => {
    if (gameId !== 'chrono' || gameState !== 'playing') return;
    const interval = setInterval(() => {
      setNeedlePos((pos) => {
        let next = pos + needleDir * 3.5;
        if (next >= 100) {
          setNeedleDir(-1);
          next = 100;
        } else if (next <= 0) {
          setNeedleDir(1);
          next = 0;
        }
        return next;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [gameId, needleDir, gameState]);

  // Overall Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setGameState('game_over');
          sounds.playError();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Complete level
  const handleLevelWin = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sounds.playLevelComplete();
    setGameState('level_won');

    const stars = lives >= 3 ? 3 : lives >= 2 ? 2 : 1;
    const finalScore = score + timeLeft * 50;
    const coins = 25 + stars * 5;

    completeGameLevel(gameId, level, stars, finalScore, coins);

    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    } catch {}
  };

  // Success step
  const registerCorrect = () => {
    sounds.playSuccess();
    const pts = 120 * combo;
    setScore((s) => s + pts);
    setCombo((c) => Math.min(5, c + 1));
    setTimeLeft((t) => Math.min(30, t + 2));

    if (trial >= totalTrials) {
      handleLevelWin();
    } else {
      setTrial((t) => t + 1);
      generateNewTrial();
    }
  };

  // Error step
  const registerError = () => {
    sounds.playError();
    setCombo(1);
    const updatedLives = lives - 1;
    setLives(updatedLives);
    setTimeLeft((t) => Math.max(1, t - 3));

    if (updatedLives <= 0) {
      setGameState('game_over');
    }
  };

  const nextLevel = () => {
    if (level < 20) {
      selectGameLevel(gameId, level + 1);
    } else {
      onClose();
    }
  };

  const restartLevel = () => {
    setGameState('playing');
    setScore(0);
    setTrial(1);
    setCombo(1);
    setLives(3);
    setTimeLeft(25);
    generateNewTrial();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm font-sans text-gray-900">
      <div className="relative w-full max-w-xl bg-white border border-gray-300 rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto">
        {/* Classic Blazor Title Bar */}
        <div className="bg-[#1b2a47] text-white px-4 py-2.5 rounded-t-xl flex items-center justify-between border-b border-gray-400">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-300" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">{gameTitle}</span>
                <span className="px-2 py-0.5 rounded bg-blue-600/40 text-blue-200 font-semibold text-xs border border-blue-400">
                  Seviye {level} / 20
                </span>
              </div>
              <span className="text-[11px] text-slate-300">{gameBadge} - Tur {trial} / {totalTrials}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLevelSelect && (
              <button
                onClick={onOpenLevelSelect}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1"
                title="Seviyeler"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Seviyeler</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-600 rounded text-slate-200 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="bg-white border border-gray-200 rounded p-2 text-center shadow-xs">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase">Süre</span>
            <span className={`text-sm font-bold ${timeLeft <= 5 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
              {timeLeft}s
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded p-2 text-center shadow-xs">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase">Aşama</span>
            <span className="text-sm font-bold text-blue-700">
              {trial} / {totalTrials}
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded p-2 text-center shadow-xs">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase">Can</span>
            <span className="text-sm font-bold text-rose-600">
              {'❤️'.repeat(lives)}
            </span>
          </div>

          <div className="bg-white border border-gray-200 rounded p-2 text-center shadow-xs">
            <span className="text-[10px] text-gray-500 font-semibold block uppercase">Skor</span>
            <span className="text-sm font-bold text-emerald-700">
              {score}
            </span>
          </div>
        </div>

        {/* GAME CONTENT CONTAINER */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-[16rem]">
          {/* 1. COLOR RUSH */}
          {gameId === 'color-rush' && (
            <div className="w-full text-center space-y-6">
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
                <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                  {colorRushPrompt.mode === 'ink' ? '🎨 MÜREKKEP RENGİNİ SEÇ' : '📝 YAZININ ANLAMINI SEÇ'}
                </span>
                <div className={`text-4xl font-black mt-3 ${colorRushPrompt.inkClass}`}>
                  {colorRushPrompt.word}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                {['Kırmızı', 'Mavi', 'Yeşil', 'Sarı'].map((col) => (
                  <button
                    key={col}
                    onClick={() => (col === colorRushPrompt.answer ? registerCorrect() : registerError())}
                    className="py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-sky-400 text-white font-black text-sm active:scale-95 transition-all shadow"
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. SEQUENCE */}
          {gameId === 'sequence' && (
            <div className="w-full text-center space-y-5">
              <p className="text-xs text-slate-400 font-semibold">
                {isShowingSequence ? '👁️ Deseni İzleyin...' : '👆 Sırayla Aynı Karelere Dokunun!'}
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto aspect-square">
                {[
                  { id: 0, color: 'bg-red-500', active: 'bg-red-300 ring-4 ring-white' },
                  { id: 1, color: 'bg-blue-500', active: 'bg-blue-300 ring-4 ring-white' },
                  { id: 2, color: 'bg-emerald-500', active: 'bg-emerald-300 ring-4 ring-white' },
                  { id: 3, color: 'bg-yellow-500', active: 'bg-yellow-300 ring-4 ring-white' },
                ].map((pad) => (
                  <button
                    key={pad.id}
                    disabled={isShowingSequence}
                    onClick={() => {
                      sounds.playClick();
                      const nextPlayerSeq = [...playerSeq, pad.id];
                      setPlayerSeq(nextPlayerSeq);
                      const currentIdx = nextPlayerSeq.length - 1;
                      if (pad.id !== simonSeq[currentIdx]) {
                        setPlayerSeq([]);
                        registerError();
                        setIsShowingSequence(true);
                        simonSeq.forEach((padIdx, i) => {
                          setTimeout(() => {
                            setActivePad(padIdx);
                            sounds.playClick();
                            setTimeout(() => setActivePad(null), 300);
                            if (i === simonSeq.length - 1) {
                              setTimeout(() => setIsShowingSequence(false), 400);
                            }
                          }, (i + 1) * 600);
                        });
                      } else if (nextPlayerSeq.length === simonSeq.length) {
                        registerCorrect();
                      }
                    }}
                    className={`rounded-3xl transition-all duration-150 aspect-square shadow-lg ${
                      activePad === pad.id ? pad.active : `${pad.color} opacity-80 hover:opacity-100`
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 3. SUBITIZING */}
          {gameId === 'subitizing' && (
            <div className="w-full text-center space-y-6">
              <div className="h-44 w-full max-w-sm mx-auto bg-slate-900/90 rounded-3xl border border-slate-800 flex items-center justify-center relative overflow-hidden">
                {showDots ? (
                  <div className="grid grid-cols-4 gap-4 p-4">
                    {Array.from({ length: dotCount }).map((_, i) => (
                      <div key={i} className="w-5 h-5 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50 animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <span className="text-sm font-bold text-slate-500">Kaç nokta vardı?</span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
                {subitizingOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => (opt === dotCount ? registerCorrect() : registerError())}
                    className="py-3 rounded-2xl bg-slate-900 hover:bg-sky-500 hover:text-white border border-slate-800 font-black text-lg transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. CHRONO TAP */}
          {gameId === 'chrono' && (
            <div className="w-full text-center space-y-6">
              <span className="text-xs uppercase font-extrabold text-amber-400">
                İbre Yeşil Bölgeye Girdiğinde DURDUR!
              </span>
              <div className="w-full max-w-md mx-auto h-12 bg-slate-900 rounded-2xl border border-slate-800 relative overflow-hidden flex items-center">
                {/* Target Zone */}
                <div
                  className="absolute h-full bg-emerald-500/30 border-x-2 border-emerald-400"
                  style={{
                    left: `${50 - targetWindow / 2}%`,
                    width: `${targetWindow}%`,
                  }}
                />
                {/* Needle */}
                <div
                  className="absolute top-0 bottom-0 w-2 bg-rose-500 shadow-md shadow-rose-500/80 transition-none"
                  style={{ left: `${needlePos}%` }}
                />
              </div>
              <button
                onClick={() => {
                  const targetLeft = 50 - targetWindow / 2;
                  const targetRight = 50 + targetWindow / 2;
                  if (needlePos >= targetLeft && needlePos <= targetRight) {
                    registerCorrect();
                  } else {
                    registerError();
                  }
                }}
                className="py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-base shadow-lg shadow-emerald-500/30 active:scale-95 transition-all"
              >
                DURDUR! 🎯
              </button>
            </div>
          )}

          {/* 5. TRAFFIC CONTROL */}
          {gameId === 'traffic' && (
            <div className="w-full text-center space-y-6">
              <div
                className={`w-32 h-32 rounded-3xl mx-auto flex items-center justify-center border-2 shadow-2xl transition-all ${
                  trafficArrow.isInverse
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400 shadow-rose-500/20'
                    : 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-emerald-500/20'
                }`}
              >
                <span className="text-5xl font-black">
                  {trafficArrow.dir === 'UP' && '↑'}
                  {trafficArrow.dir === 'DOWN' && '↓'}
                  {trafficArrow.dir === 'LEFT' && '←'}
                  {trafficArrow.dir === 'RIGHT' && '→'}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-300 block">
                {trafficArrow.isInverse ? '🔴 KIRMIZI: Ters Yöne Bas!' : '🟢 YEŞİL: Gösterilen Yöne Bas!'}
              </span>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                {(['UP', 'DOWN', 'LEFT', 'RIGHT'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      const expected = trafficArrow.isInverse
                        ? d === (trafficArrow.dir === 'UP' ? 'DOWN' : trafficArrow.dir === 'DOWN' ? 'UP' : trafficArrow.dir === 'LEFT' ? 'RIGHT' : 'LEFT')
                        : d === trafficArrow.dir;
                      if (expected) registerCorrect();
                      else registerError();
                    }}
                    className="py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-400 text-white font-black text-sm active:scale-95"
                  >
                    {d === 'UP' && 'YUKARI (↑)'}
                    {d === 'DOWN' && 'AŞAĞI (↓)'}
                    {d === 'LEFT' && 'SOL (←)'}
                    {d === 'RIGHT' && 'SAĞ (→)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. SWITCH TASK */}
          {gameId === 'switch-task' && (
            <div className="w-full text-center space-y-6">
              <div
                className={`p-6 rounded-3xl border max-w-xs mx-auto shadow-xl transition-all ${
                  switchItem.mode === 'color-number'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-amber-500/20 border-amber-500 text-amber-300'
                }`}
              >
                <span className="text-xs font-black uppercase tracking-wider block mb-2">
                  {switchItem.mode === 'color-number' ? '🔵 MAVİ: Sayı Çift mi Tek mi?' : '🟠 TURUNCU: Harf Sesli mi Sessiz mi?'}
                </span>
                <span className="text-5xl font-black text-white">
                  {switchItem.letter}{switchItem.digit}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                {switchItem.mode === 'color-number' ? (
                  <>
                    <button
                      onClick={() => (switchItem.digit % 2 === 0 ? registerCorrect() : registerError())}
                      className="py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-400 text-white font-black text-sm"
                    >
                      ÇİFT
                    </button>
                    <button
                      onClick={() => (switchItem.digit % 2 !== 0 ? registerCorrect() : registerError())}
                      className="py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-400 text-white font-black text-sm"
                    >
                      TEK
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => (['A', 'E', 'O'].includes(switchItem.letter) ? registerCorrect() : registerError())}
                      className="py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400 text-white font-black text-sm"
                    >
                      SESLİ
                    </button>
                    <button
                      onClick={() => (!['A', 'E', 'O'].includes(switchItem.letter) ? registerCorrect() : registerError())}
                      className="py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-400 text-white font-black text-sm"
                    >
                      SESSİZ
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 7. RADAR TRACKING */}
          {gameId === 'radar' && (
            <div className="w-full text-center space-y-5">
              <span className="text-xs text-slate-300 font-bold block">
                {revealedRadar ? '👁️ Parlayan Hedef Noktaları Ezberle!' : '🎯 Orijinal Hedef Noktaları Seç!'}
              </span>
              <div className="grid grid-cols-4 gap-3 max-w-xs mx-auto">
                {Array.from({ length: 8 }).map((_, i) => {
                  const isTarget = radarTargets.includes(i);
                  const isSelected = selectedRadar.includes(i);
                  return (
                    <button
                      key={i}
                      disabled={revealedRadar}
                      onClick={() => {
                        if (selectedRadar.includes(i)) return;
                        if (!isTarget) {
                          setSelectedRadar([]);
                          registerError();
                        } else {
                          const nextSel = [...selectedRadar, i];
                          setSelectedRadar(nextSel);
                          if (nextSel.length === radarTargets.length) {
                            registerCorrect();
                          }
                        }
                      }}
                      className={`h-16 rounded-2xl border transition-all flex items-center justify-center font-black ${
                        revealedRadar && isTarget
                          ? 'bg-cyan-500 border-white text-white shadow-lg shadow-cyan-500/50 scale-105'
                          : isSelected
                          ? 'bg-emerald-500 border-white text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      ●
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 8. SYLLOGISM */}
          {gameId === 'syllogism' && (
            <div className="w-full text-center space-y-6">
              <div className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 text-sm font-bold text-white max-w-md mx-auto leading-relaxed">
                {syllogismQuestion.premise}
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                <button
                  onClick={() => (syllogismQuestion.isTrue ? registerCorrect() : registerError())}
                  className="py-3.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-black text-sm"
                >
                  DOĞRU (✓)
                </button>
                <button
                  onClick={() => (!syllogismQuestion.isTrue ? registerCorrect() : registerError())}
                  className="py-3.5 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-black text-sm"
                >
                  YANLIŞ (✗)
                </button>
              </div>
            </div>
          )}

          {/* 9. SPATIAL ROTATION */}
          {gameId === 'spatial' && (
            <div className="w-full text-center space-y-6">
              <div className="flex items-center justify-center gap-6 p-4 bg-slate-900 rounded-3xl border border-slate-800 max-w-xs mx-auto">
                <div className="w-16 h-16 bg-sky-500/20 border-2 border-sky-400 rounded-xl flex items-center justify-center text-sky-300 text-2xl font-black">
                  ▛▜
                </div>
                <div
                  className="w-16 h-16 bg-purple-500/20 border-2 border-purple-400 rounded-xl flex items-center justify-center text-purple-300 text-2xl font-black"
                  style={{ transform: `rotate(${spatialMatch.angle}deg)` }}
                >
                  {spatialMatch.isSame ? '▛▜' : '▜▛'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
                <button
                  onClick={() => (spatialMatch.isSame ? registerCorrect() : registerError())}
                  className="py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-400 text-white font-black text-sm"
                >
                  AYNI ŞEKİL
                </button>
                <button
                  onClick={() => (!spatialMatch.isSame ? registerCorrect() : registerError())}
                  className="py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-400 text-white font-black text-sm"
                >
                  FARKLI / AYNA
                </button>
              </div>
            </div>
          )}

          {/* 10. WORD PAIR */}
          {gameId === 'word-pair' && (
            <div className="w-full text-center space-y-6">
              {wordPairData.isMemorizePhase ? (
                <div className="p-6 bg-slate-900 rounded-3xl border border-sky-500/40 max-w-xs mx-auto animate-pulse">
                  <span className="text-xs text-sky-400 font-bold block mb-1">EŞLEŞMEYİ EZBERLE</span>
                  <span className="text-xl font-black text-white">
                    {wordPairData.prompt} ⟷ {wordPairData.answer}
                  </span>
                </div>
              ) : (
                <div className="space-y-4">
                  <span className="text-lg font-black text-white block">
                    {wordPairData.prompt} ⟷ [ ? ]
                  </span>
                  <div className="grid grid-cols-2 gap-2.5 max-w-xs mx-auto">
                    {wordPairData.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => (opt === wordPairData.answer ? registerCorrect() : registerError())}
                        className="py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-400 text-white font-bold text-xs"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 11. MAGNITUDE ESTIMATE */}
          {gameId === 'estimate' && (
            <div className="w-full text-center space-y-6">
              <span className="text-xs uppercase font-extrabold text-amber-400">
                HANGİ DEĞER DAHA BÜYÜK?
              </span>
              <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                <button
                  onClick={() => (magnitudeData.isLeftBigger ? registerCorrect() : registerError())}
                  className="p-5 rounded-3xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 hover:border-sky-400 text-white font-black text-base transition-all active:scale-95"
                >
                  {magnitudeData.leftVal}
                </button>
                <button
                  onClick={() => (!magnitudeData.isLeftBigger ? registerCorrect() : registerError())}
                  className="p-5 rounded-3xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-800 hover:border-purple-400 text-white font-black text-base transition-all active:scale-95"
                >
                  {magnitudeData.rightVal}
                </button>
              </div>
            </div>
          )}

          {/* 12. CIRCUIT FLOW */}
          {gameId === 'circuit' && (
            <div className="w-full text-center space-y-5">
              <span className="text-xs text-sky-400 font-extrabold uppercase tracking-wider block">
                ⚡ Tüm Devre Hatlarını Yatay (━) Hizala!
              </span>
              <div className="grid grid-cols-2 gap-3 max-w-[200px] mx-auto p-4 bg-slate-900 rounded-2xl border border-cyan-500/30 shadow-lg">
                {circuitRotations.map((rot, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sounds.playClick();
                      const next = [...circuitRotations];
                      next[idx] = (next[idx] + 90) % 360;
                      setCircuitRotations(next);
                      if (next.every((a) => a % 180 === 0)) {
                        registerCorrect();
                      }
                    }}
                    className={`w-20 h-20 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      rot % 180 === 0
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-md shadow-cyan-500/30'
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className="w-12 h-2.5 rounded-full transition-transform duration-200"
                      style={{
                        backgroundColor: rot % 180 === 0 ? '#22d3ee' : '#64748b',
                        transform: `rotate(${rot}deg)`,
                      }}
                    />
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400">Hatları 90° döndürmek için üzerlerine tıkla.</p>
            </div>
          )}

          {/* 13. TOWER OF HANOI */}
          {gameId === 'tower' && (
            <div className="w-full text-center space-y-4">
              <span className="text-xs text-teal-400 font-extrabold uppercase tracking-wider block">
                🏗️ Tüm Halkaları En Sağdaki Sütuna (C) Taşı!
              </span>
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto p-4 bg-slate-900 rounded-2xl border border-teal-500/30">
                {[0, 1, 2].map((pegIdx) => {
                  const diskStack = pegs[pegIdx] || [];
                  const isSelected = selectedPeg === pegIdx;
                  return (
                    <button
                      key={pegIdx}
                      onClick={() => {
                        sounds.playClick();
                        if (selectedPeg === null) {
                          if (diskStack.length > 0) setSelectedPeg(pegIdx);
                        } else if (selectedPeg === pegIdx) {
                          setSelectedPeg(null);
                        } else {
                          const srcDisks = [...pegs[selectedPeg]];
                          const movingDisk = srcDisks[srcDisks.length - 1];
                          const destDisks = [...pegs[pegIdx]];
                          const destTop = destDisks[destDisks.length - 1];

                          if (destTop && destTop < movingDisk) {
                            sounds.playError();
                            setSelectedPeg(null);
                          } else {
                            srcDisks.pop();
                            destDisks.push(movingDisk);
                            const newPegs = [...pegs];
                            newPegs[selectedPeg] = srcDisks;
                            newPegs[pegIdx] = destDisks;
                            setPegs(newPegs);
                            setSelectedPeg(null);

                            const totalDisks = Math.min(3, 2 + Math.floor(level / 10));
                            if (newPegs[2].length === totalDisks) {
                              registerCorrect();
                            }
                          }
                        }
                      }}
                      className={`h-36 rounded-xl border flex flex-col justify-end items-center pb-2 relative transition-all ${
                        isSelected
                          ? 'border-teal-400 bg-teal-500/10 shadow-lg shadow-teal-500/20'
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="absolute top-3 bottom-2 w-1.5 bg-slate-700 rounded-full" />
                      <div className="z-10 flex flex-col-reverse gap-1.5 items-center w-full px-1">
                        {diskStack.map((d) => (
                          <div
                            key={d}
                            className={`h-4 rounded-md transition-all ${
                              d === 1
                                ? 'w-8 bg-amber-400'
                                : d === 2
                                ? 'w-14 bg-sky-400'
                                : 'w-20 bg-rose-500'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold mt-2">
                        {pegIdx === 0 ? 'A' : pegIdx === 1 ? 'B' : 'C (Hedef)'}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400">Büyük halka küçük halkanın üzerine konamaz.</p>
            </div>
          )}

          {/* 14. PERIPHERAL VISION */}
          {gameId === 'peripheral' && (
            <div className="w-full text-center space-y-4">
              <span className="text-xs text-amber-400 font-extrabold uppercase tracking-wider block">
                🔭 Gözünü Merkezden Ayırma! Parıldayan Köşeye Bas!
              </span>
              <div className="relative w-64 h-64 mx-auto bg-slate-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-xl grid grid-cols-2 grid-rows-2">
                {[
                  { id: 0, label: 'Sol Üst', x: 20, y: 20 },
                  { id: 1, label: 'Sağ Üst', x: 80, y: 20 },
                  { id: 2, label: 'Sol Alt', x: 20, y: 80 },
                  { id: 3, label: 'Sağ Alt', x: 80, y: 80 },
                ].map((q) => {
                  const hasBlip = peripheralBlip && peripheralBlip.x === q.x && peripheralBlip.y === q.y;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        if (hasBlip) {
                          registerCorrect();
                        } else {
                          registerError();
                        }
                      }}
                      className="border border-slate-800/60 hover:bg-slate-800/40 relative flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {hasBlip && (
                        <div className="w-6 h-6 rounded-full bg-amber-400 shadow-[0_0_15px_#f59e0b] animate-ping" />
                      )}
                    </button>
                  );
                })}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-7 h-7 rounded-full border-2 border-red-500 flex items-center justify-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">Merkeze odaklanırken görüş alanının kenarlarındaki parlamayı yakala.</p>
            </div>
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
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/20">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-white">Seviye Tamamlandı!</h3>
                <p className="text-xs text-slate-400 mt-1">Bilişsel antrenmanı başarıyla geçtin.</p>
              </div>

              <div className="flex items-center gap-2">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-7 h-7 ${
                      star <= (lives >= 3 ? 3 : 2)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-700'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 px-5 py-2.5 rounded-2xl text-xs font-bold">
                <span className="text-amber-400">+{25 + (lives >= 3 ? 10 : 0)} 🪙 Altın</span>
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
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-500/30"
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
                <h3 className="text-2xl font-black text-white">Tur Başarısız!</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Dikkatini topla ve seviyeyi baştan dene.
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
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/25"
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
