'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { sounds } from '@/utils/audio';
import { useCognitiveStore } from '@/store/cognitiveStore';
import { useGameStore } from '@/store/gameStore';
import { MAZE_LEVELS, MazeLevelData, CellType } from '@/data/mazeLevels';
import confetti from 'canvas-confetti';
import {
  Compass,
  Zap,
  RotateCcw,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Key,
  Lock,
  Unlock,
  AlertTriangle,
  X,
  Sparkles,
  Footprints,
  Star,
  Coins,
  Grid,
  Package,
  Layers,
  Radio,
  Lightbulb
} from 'lucide-react';

interface LogicMazeGameProps {
  onClose: () => void;
  onOpenLevelSelect?: () => void;
}

export const LogicMazeGame: React.FC<LogicMazeGameProps> = ({ onClose, onOpenLevelSelect }) => {
  const { recordSessionResult } = useCognitiveStore();
  const {
    selectedMazeLevel,
    selectMazeLevel,
    completeMazeLevel,
    addCoins,
  } = useGameStore();

  const currentLevelIdx = Math.max(0, Math.min(MAZE_LEVELS.length - 1, selectedMazeLevel - 1));
  const level: MazeLevelData = MAZE_LEVELS[currentLevelIdx];

  // Dynamic grid state (contains pushable boxes, switches, plates)
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [movesLeft, setMovesLeft] = useState(level.maxMoves);
  const [movesTaken, setMovesTaken] = useState(0);

  // Puzzle States
  const [collectedKeys, setCollectedKeys] = useState<{ red: boolean; blue: boolean }>({
    red: false,
    blue: false,
  });
  const [laserRedActive, setLaserRedActive] = useState<boolean>(true); // Red laser on by default
  const [platesActive, setPlatesActive] = useState<boolean>(false);
  const [coinsCollectedThisRound, setCoinsCollectedThisRound] = useState(0);
  const [collectedCoinLocations, setCollectedCoinLocations] = useState<string[]>([]);

  // Telemetry
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const lastStepTimeRef = useRef<number>(Date.now());
  const [trapHits, setTrapHits] = useState(0);

  // Status
  const [status, setStatus] = useState<'playing' | 'level_cleared' | 'game_over_moves'>('playing');
  const [starsEarnedThisRound, setStarsEarnedThisRound] = useState(0);
  const [showInGameTip, setShowInGameTip] = useState(false);

  // Initialize level
  const initLevel = useCallback((lvl: MazeLevelData) => {
    // Deep clone level layout
    const initialGrid: CellType[][] = lvl.layout.map((row) => [...row]);

    let startR = 0;
    let startC = 0;
    for (let r = 0; r < lvl.gridSize; r++) {
      for (let c = 0; c < lvl.gridSize; c++) {
        if (initialGrid[r][c] === 'start') {
          startR = r;
          startC = c;
        }
      }
    }

    setGrid(initialGrid);
    setPlayerPos({ r: startR, c: startC });
    setMovesLeft(lvl.maxMoves);
    setMovesTaken(0);
    setCollectedKeys({ red: false, blue: false });
    setLaserRedActive(true);
    setPlatesActive(false);
    setCoinsCollectedThisRound(0);
    setCollectedCoinLocations([]);
    setStatus('playing');
    lastStepTimeRef.current = Date.now();
  }, []);

  useEffect(() => {
    initLevel(level);
  }, [level, initLevel]);

  // Check if plate has a box on it
  const checkPlates = useCallback((currentGrid: CellType[][]) => {
    for (let r = 0; r < level.gridSize; r++) {
      for (let c = 0; c < level.gridSize; c++) {
        if (level.layout[r][c] === 'plate') {
          // If a box is on the plate position
          if (currentGrid[r][c] === 'box') {
            return true;
          }
        }
      }
    }
    return false;
  }, [level]);

  // Find Portal partner
  const findPortalPartner = useCallback((targetType: 'portal_a' | 'portal_b'): { r: number; c: number } | null => {
    const partner = targetType === 'portal_a' ? 'portal_b' : 'portal_a';
    for (let r = 0; r < level.gridSize; r++) {
      for (let c = 0; c < level.gridSize; c++) {
        if (level.layout[r][c] === partner) {
          return { r, c };
        }
      }
    }
    return null;
  }, [level]);

  // Execute Move (Handles step, push box, slide on ice, teleporters, switches)
  const tryMove = useCallback((dr: number, dc: number) => {
    if (status !== 'playing') return;

    const targetR = playerPos.r + dr;
    const targetC = playerPos.c + dc;

    // Bounds check
    if (targetR < 0 || targetR >= level.gridSize || targetC < 0 || targetC >= level.gridSize) {
      return;
    }

    const targetCell = grid[targetR][targetC];

    // Wall collision
    if (targetCell === 'wall') {
      sounds.playWrong();
      return;
    }

    // Locked door check
    if (targetCell === 'door_red' && !collectedKeys.red) {
      sounds.playWrong();
      return;
    }
    if (targetCell === 'door_blue' && !collectedKeys.blue) {
      sounds.playWrong();
      return;
    }

    // Active Laser check
    if (targetCell === 'laser_red' && laserRedActive) {
      sounds.playWrong();
      return;
    }
    if (targetCell === 'laser_blue' && !laserRedActive) {
      sounds.playWrong();
      return;
    }

    let nextGrid = grid.map((row) => [...row]);

    // PUSHABLE BOX MECHANIC (Car Parking / Sokoban)
    if (targetCell === 'box') {
      const boxNextR = targetR + dr;
      const boxNextC = targetC + dc;

      // Cannot push box out of bounds
      if (boxNextR < 0 || boxNextR >= level.gridSize || boxNextC < 0 || boxNextC >= level.gridSize) {
        sounds.playWrong();
        return;
      }

      const behindBoxCell = nextGrid[boxNextR][boxNextC];

      // Box cannot be pushed into wall, another box, exit, laser, or locked door
      if (
        behindBoxCell === 'wall' ||
        behindBoxCell === 'box' ||
        behindBoxCell === 'exit' ||
        (behindBoxCell === 'laser_red' && laserRedActive) ||
        (behindBoxCell === 'laser_blue' && !laserRedActive) ||
        (behindBoxCell === 'door_red' && !collectedKeys.red) ||
        (behindBoxCell === 'door_blue' && !collectedKeys.blue)
      ) {
        sounds.playWrong();
        return;
      }

      // Slide box if behind is ice
      let finalBoxR = boxNextR;
      let finalBoxC = boxNextC;
      if (behindBoxCell === 'ice') {
        while (true) {
          const nextR = finalBoxR + dr;
          const nextC = finalBoxC + dc;
          if (
            nextR < 0 ||
            nextR >= level.gridSize ||
            nextC < 0 ||
            nextC >= level.gridSize ||
            nextGrid[nextR][nextC] === 'wall' ||
            nextGrid[nextR][nextC] === 'box'
          ) {
            break;
          }
          finalBoxR = nextR;
          finalBoxC = nextC;
          if (nextGrid[nextR][nextC] !== 'ice') break;
        }
      }

      // Move the box
      nextGrid[targetR][targetC] = level.layout[targetR][targetC] === 'plate' ? 'plate' : 'empty';
      nextGrid[finalBoxR][finalBoxC] = 'box';

      sounds.playRuleShift();
    }

    // Step timing
    const now = Date.now();
    setReactionTimes((prev) => [...prev, now - lastStepTimeRef.current]);
    lastStepTimeRef.current = now;

    // Deduct 1 move
    const newMovesLeft = movesLeft - 1;
    setMovesLeft(newMovesLeft);
    setMovesTaken((m) => m + 1);

    // SLIDING ICE MECHANIC (Player slides until non-ice or wall)
    let finalPlayerR = targetR;
    let finalPlayerC = targetC;

    if (targetCell === 'ice') {
      while (true) {
        const nextR = finalPlayerR + dr;
        const nextC = finalPlayerC + dc;

        if (nextR < 0 || nextR >= level.gridSize || nextC < 0 || nextC >= level.gridSize) {
          break;
        }

        const nextCell = nextGrid[nextR][nextC];
        if (
          nextCell === 'wall' ||
          nextCell === 'box' ||
          (nextCell === 'laser_red' && laserRedActive) ||
          (nextCell === 'laser_blue' && !laserRedActive) ||
          (nextCell === 'door_red' && !collectedKeys.red) ||
          (nextCell === 'door_blue' && !collectedKeys.blue)
        ) {
          break;
        }

        finalPlayerR = nextR;
        finalPlayerC = nextC;

        // Stop sliding if non-ice cell reached
        if (nextCell !== 'ice') {
          break;
        }
      }
    }

    // TELEPORTER / PORTAL MECHANIC
    const finalCell = nextGrid[finalPlayerR][finalPlayerC];
    if (finalCell === 'portal_a' || finalCell === 'portal_b') {
      const partner = findPortalPartner(finalCell);
      if (partner) {
        finalPlayerR = partner.r;
        finalPlayerC = partner.c;
        sounds.playRuleShift();
      }
    }

    // TOGGLE SWITCH MECHANIC
    if (finalCell === 'switch') {
      setLaserRedActive((prev) => !prev);
      sounds.playRuleShift();
    }

    // KEY COLLECTION
    if (finalCell === 'key_red' && !collectedKeys.red) {
      setCollectedKeys((k) => ({ ...k, red: true }));
      sounds.playRuleShift();
    } else if (finalCell === 'key_blue' && !collectedKeys.blue) {
      setCollectedKeys((k) => ({ ...k, blue: true }));
      sounds.playRuleShift();
    }

    // COIN COLLECTION
    const coinKey = `${finalPlayerR}-${finalPlayerC}`;
    if (finalCell === 'coin' && !collectedCoinLocations.includes(coinKey)) {
      setCoinsCollectedThisRound((c) => c + 1);
      setCollectedCoinLocations((prev) => [...prev, coinKey]);
      addCoins(25);
      sounds.playCorrect();
    }

    // HAZARD HIT
    if (finalCell === 'hazard') {
      sounds.playWrong();
      setTrapHits((t) => t + 1);
      setMovesLeft((m) => Math.max(0, m - 2)); // -2 Moves trap penalty!
    } else if (finalCell !== 'coin' && finalCell !== 'switch') {
      sounds.playCorrect();
    }

    // Check plates
    const plateActive = checkPlates(nextGrid);
    setPlatesActive(plateActive);

    setGrid(nextGrid);
    setPlayerPos({ r: finalPlayerR, c: finalPlayerC });

    // EXIT REACHED: WIN!
    if (finalCell === 'exit') {
      let stars = 1;
      if (newMovesLeft >= level.threeStarMoves) {
        stars = 3;
      } else if (newMovesLeft >= 1) {
        stars = 2;
      }

      setStarsEarnedThisRound(stars);
      const levelScore = 600 + newMovesLeft * 120 + coinsCollectedThisRound * 150 + stars * 250;
      const coinReward = 60 + coinsCollectedThisRound * 30 + stars * 50;

      completeMazeLevel(level.levelNumber, stars, levelScore, coinReward);
      recordSessionResult({
        id: `session-maze-lvl${level.levelNumber}-${Date.now()}`,
        gameId: 'neural-labyrinth',
        gameTitle: `Neural Maze (Seviye ${level.levelNumber})`,
        domain: 'problemSolving',
        timestamp: 'Az önce',
        score: levelScore,
        accuracy: Math.max(65, 100 - trapHits * 15),
        averageReactionTimeMs: 270,
        peakStreak: stars,
        difficultyReached: level.levelNumber,
        ruleShiftsHandled: 3,
        plateauBreakerBonus: stars * 150,
        breakdown: {
          ruleSwitchErrors: trapHits,
          distractorErrors: 0,
          speedVsAccuracyBalance: stars === 3 ? 'Kusursuz Algoritma' : 'İyi Rota',
          cognitiveFatigueOnsetMs: 30000,
        },
        farTransferFeedback: `Seviye ${level.levelNumber}'i ${movesTaken + 1} hamlede çözdünüz. Sınırlı bütçeyle darboğazları önceden hesaplama yeteneğiniz pekişti.`,
      });

      sounds.playGameComplete();
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.6 } });
      setStatus('level_cleared');
      return;
    }

    // OUT OF MOVES: LOSE!
    if (newMovesLeft <= 0) {
      sounds.playWrong();
      setStatus('game_over_moves');
    }
  }, [
    status,
    level,
    playerPos,
    grid,
    collectedKeys,
    laserRedActive,
    movesLeft,
    movesTaken,
    collectedCoinLocations,
    coinsCollectedThisRound,
    findPortalPartner,
    checkPlates,
    addCoins,
    completeMazeLevel,
    recordSessionResult,
    trapHits,
  ]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (status !== 'playing') return;

      if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        tryMove(-1, 0);
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        tryMove(1, 0);
      } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        tryMove(0, -1);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        tryMove(0, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, tryMove, onClose]);

  // Handle cell click
  const handleCellClick = (r: number, c: number) => {
    const dr = r - playerPos.r;
    const dc = c - playerPos.c;
    if (Math.abs(dr) + Math.abs(dc) === 1) {
      tryMove(dr, dc);
    }
  };

  const handleNextLevel = () => {
    const nextLvlNum = Math.min(MAZE_LEVELS.length, level.levelNumber + 1);
    selectMazeLevel(nextLvlNum);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl">
      <div className="relative w-full max-w-2xl bg-slate-950 border border-emerald-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl overflow-hidden flex flex-col justify-between min-h-[620px]">
        {/* Glows */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 relative z-10 gap-2">
          {/* Left: Level selector & Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={onOpenLevelSelect}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-400 text-emerald-400 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0"
            >
              <Grid className="w-4 h-4" />
              <span className="hidden sm:inline">Seviyeler</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white truncate">{level.title}</h2>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30 shrink-0">
                  {level.mechanicBadge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{level.tip}</p>
            </div>
          </div>

          {/* Right: Stats, Coach Tip & Pinned Close Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Coin Bonus */}
            <div className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black">
              <Coins className="w-3.5 h-3.5 fill-amber-400/20" />
              <span>+{coinsCollectedThisRound * 25} 🪙</span>
            </div>

            {/* SIKI HAMLE SAYACI */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-black transition-all shrink-0 ${
                movesLeft <= 2
                  ? 'bg-rose-500/25 border-rose-500/60 text-rose-300 animate-pulse scale-105 shadow-lg shadow-rose-500/30'
                  : movesLeft <= 4
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-emerald-400'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>{movesLeft} Hamle</span>
            </div>

            {/* Quick Coach Tip */}
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

        {/* Puzzle Status Bar (Switches & Laser Status) */}
        <div className="my-1.5 flex items-center justify-between text-xs px-1">
          <div className="flex items-center gap-2">
            {/* Laser State Indicator */}
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-400">Lazer:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  laserRedActive
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                    : 'bg-sky-500/20 text-sky-300 border-sky-500/50'
                }`}
              >
                {laserRedActive ? '🔴 Kırmızı Aktif' : '🔵 Mavi Aktif'}
              </span>
            </div>

            {/* Keys */}
            {level.requiredKeys.map((k) => (
              <span
                key={`key-hud-${k}`}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                  collectedKeys[k]
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                <Key className="w-3 h-3 inline mr-1" />
                {k === 'red' ? 'Kırmızı' : 'Mavi'} Anahtar {collectedKeys[k] ? '✓' : ''}
              </span>
            ))}
          </div>

          <div className="text-[11px] text-slate-400">
            3 Yıldız: <strong className="text-amber-400">Kalan Hamle ≥ {level.threeStarMoves}</strong>
          </div>
        </div>

        {/* Nöro-Koç Seviye İpucu Kartı (Interactive Coach Overlay) */}
        {showInGameTip && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-2xl text-xs text-amber-200 flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-bold block mb-0.5">Seviye {level.levelNumber} Nöro-Koç Tavsiyesi:</strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">{level.tip}</p>
                <div className="text-[10px] text-amber-400 mt-1">
                  Mekanik: {level.mechanicBadge} | Çıkıştan geriye doğru iz sürmek hamle tasarrufu sağlar.
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

        {/* --- MAIN GAME BOARD: HIGH IQ PUZZLE GRID --- */}
        <div className="flex-1 flex items-center justify-center my-1 select-none relative">
          <div
            className="grid gap-1.5 sm:gap-2 p-3 rounded-3xl bg-slate-900/90 border-2 border-slate-800 shadow-2xl relative"
            style={{
              gridTemplateColumns: `repeat(${level.gridSize}, minmax(0, 1fr))`,
              width: `${Math.min(460, level.gridSize * (level.gridSize > 6 ? 56 : 68))}px`,
              height: `${Math.min(460, level.gridSize * (level.gridSize > 6 ? 56 : 68))}px`,
            }}
          >
            {grid.map((row, r) =>
              row.map((cellType, c) => {
                const isPlayerHere = playerPos.r === r && playerPos.c === c;
                const isAdjacent = Math.abs(r - playerPos.r) + Math.abs(c - playerPos.c) === 1;
                const isCoinCollected = collectedCoinLocations.includes(`${r}-${c}`);
                const baseCell = level.layout[r][c];

                return (
                  <div
                    key={`cell-${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`relative rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer text-xs font-bold overflow-hidden ${
                      cellType === 'wall'
                        ? 'bg-slate-950 border border-slate-800/80 shadow-inner'
                        : cellType === 'ice'
                        ? 'bg-sky-950/40 border border-sky-400/40 shadow-inner'
                        : cellType === 'plate' || baseCell === 'plate'
                        ? 'bg-yellow-950/40 border border-yellow-500/50'
                        : 'bg-slate-850/80 border border-slate-700/60 hover:border-slate-500'
                    } ${isAdjacent && cellType !== 'wall' ? 'ring-1 ring-emerald-400/50 hover:scale-105' : ''}`}
                  >
                    {/* WALL */}
                    {cellType === 'wall' && (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center opacity-40">
                        <div className="w-2.5 h-2.5 rounded-sm bg-slate-700" />
                      </div>
                    )}

                    {/* ICE TILE (Slippery Floor) */}
                    {cellType === 'ice' && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
                        <span className="text-[10px] text-sky-300 font-mono tracking-widest">BUZ</span>
                      </div>
                    )}

                    {/* PRESSURE PLATE (Button for box) */}
                    {baseCell === 'plate' && cellType !== 'box' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-yellow-400 pointer-events-none">
                        <Radio className="w-4 h-4 animate-ping opacity-60" />
                        <span className="text-[8px] font-bold">BUTON</span>
                      </div>
                    )}

                    {/* PUSHABLE BOX (Sokoban Block) */}
                    {cellType === 'box' && (
                      <motion.div
                        layoutId={`box-${r}-${c}`}
                        className={`absolute inset-1.5 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 flex flex-col items-center justify-center shadow-lg border-2 border-white text-slate-950 z-10 ${
                          baseCell === 'plate' ? 'ring-2 ring-emerald-400 shadow-emerald-500/50' : ''
                        }`}
                      >
                        <Package className="w-4 sm:w-5 h-4 sm:h-5 text-slate-950" />
                        <span className="text-[8px] font-black tracking-tight leading-none mt-0.5">
                          {baseCell === 'plate' ? 'AKTİF ✓' : 'BLOK'}
                        </span>
                      </motion.div>
                    )}

                    {/* TOGGLE SWITCH */}
                    {cellType === 'switch' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-yellow-300 animate-pulse">
                        <Zap className="w-5 h-5 filter drop-shadow-[0_0_6px_rgba(253,224,71,0.8)]" />
                        <span className="text-[7px] font-bold">ŞALTER</span>
                      </div>
                    )}

                    {/* RED LASER BARRIER */}
                    {cellType === 'laser_red' && (
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center transition-all ${
                          laserRedActive
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-500/70 animate-pulse'
                            : 'opacity-20 text-slate-600'
                        }`}
                      >
                        <Lock className="w-4 h-4" />
                        <span className="text-[7px] font-black">{laserRedActive ? 'LAZER' : 'AÇIK'}</span>
                      </div>
                    )}

                    {/* BLUE LASER BARRIER */}
                    {cellType === 'laser_blue' && (
                      <div
                        className={`absolute inset-0 flex flex-col items-center justify-center transition-all ${
                          !laserRedActive
                            ? 'bg-sky-950/80 text-sky-400 border border-sky-500/70 animate-pulse'
                            : 'opacity-20 text-slate-600'
                        }`}
                      >
                        <Lock className="w-4 h-4" />
                        <span className="text-[7px] font-black">{!laserRedActive ? 'LAZER' : 'AÇIK'}</span>
                      </div>
                    )}

                    {/* EXIT */}
                    {cellType === 'exit' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-400 animate-pulse">
                        <Trophy className="w-5 sm:w-6 h-5 sm:h-6 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
                        <span className="text-[8px] font-black uppercase">ÇIKIŞ</span>
                      </div>
                    )}

                    {/* COINS */}
                    {cellType === 'coin' && !isCoinCollected && (
                      <div className="absolute inset-0 flex items-center justify-center text-amber-400 animate-bounce">
                        <Coins className="w-5 h-5 filter drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                      </div>
                    )}

                    {/* RED KEY */}
                    {cellType === 'key_red' && (
                      <div className={`absolute inset-0 flex flex-col items-center justify-center ${collectedKeys.red ? 'opacity-20' : 'text-rose-400 animate-bounce'}`}>
                        <Key className="w-5 h-5 filter drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
                        <span className="text-[7px] font-bold">KIRMIZI</span>
                      </div>
                    )}

                    {/* RED DOOR */}
                    {cellType === 'door_red' && (
                      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all ${
                        collectedKeys.red ? 'bg-rose-500/10 text-rose-300' : 'bg-rose-950/80 text-rose-400 border border-rose-500/50'
                      }`}>
                        {collectedKeys.red ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 animate-pulse" />}
                        <span className="text-[7px] font-bold">{collectedKeys.red ? 'AÇIK' : 'KİLİT'}</span>
                      </div>
                    )}

                    {/* PORTALS */}
                    {(cellType === 'portal_a' || cellType === 'portal_b') && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-purple-400 animate-spin-slow">
                        <Sparkles className="w-5 h-5 filter drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                        <span className="text-[7px] font-bold">PORTAL</span>
                      </div>
                    )}

                    {/* HAZARD */}
                    {cellType === 'hazard' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-rose-500/90">
                        <AlertTriangle className="w-4 h-4 animate-pulse" />
                        <span className="text-[7px] font-bold">-2</span>
                      </div>
                    )}

                    {/* PLAYER AVATAR */}
                    {isPlayerHere && (
                      <motion.div
                        layoutId="maze-player-avatar"
                        className="absolute inset-1.5 rounded-xl bg-gradient-to-tr from-emerald-400 via-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-emerald-500/80 z-20 border-2 border-white pointer-events-none"
                        transition={{ type: 'spring', stiffness: 450, damping: 26 }}
                      >
                        <div className="w-3.5 h-3.5 rounded-full bg-white shadow-inner animate-ping opacity-95" />
                      </motion.div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>Yön Tuşları:</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono text-[11px]">W A S D</span>
            <span>/</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono text-[11px]">↑ ↓ ← →</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => initLevel(level)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-all text-xs font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Yeniden Başlat</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-white transition-all text-xs font-bold"
              title="Oyundan Çık (Esc)"
            >
              <X className="w-3.5 h-3.5" />
              <span>Oyundan Çık</span>
            </button>
          </div>
        </div>

        {/* --- MODAL: LEVEL CLEARED --- */}
        <AnimatePresence>
          {status === 'level_cleared' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4"
            >
              {/* Stars */}
              <div className="flex items-center gap-2 mb-1">
                {[1, 2, 3].map((starIdx) => (
                  <motion.div
                    key={`win-star-${starIdx}`}
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.15 * starIdx, type: 'spring' }}
                  >
                    <Star
                      className={`w-10 sm:w-12 h-10 sm:h-12 ${
                        starsEarnedThisRound >= starIdx
                          ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]'
                          : 'text-slate-700'
                      }`}
                    />
                  </motion.div>
                ))}
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  Seviye {level.levelNumber} Başarıldı!
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  {starsEarnedThisRound === 3
                    ? 'Kusursuz zihin planlaması! Sıfır hata ile 3 yıldız kazandınız!'
                    : 'Güzel rota! Bir sonraki seviyede daha az adımla 3 yıldızı kapmayı deneyin.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-900/90 p-4 rounded-2xl border border-slate-800 w-full max-w-xs">
                <div>
                  <span className="text-slate-400 block">Kazanılan Altın:</span>
                  <span className="text-lg font-black text-amber-400 flex items-center justify-center gap-1">
                    <Coins className="w-4 h-4" />
                    +{60 + coinsCollectedThisRound * 30 + starsEarnedThisRound * 50}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kalan Hamle:</span>
                  <span className="text-lg font-black text-emerald-400">{movesLeft} Hamle</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full max-w-xs pt-2">
                <button
                  onClick={() => initLevel(level)}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Tekrar</span>
                </button>

                {level.levelNumber < MAZE_LEVELS.length ? (
                  <button
                    onClick={handleNextLevel}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5"
                  >
                    <span>Sonraki Seviye</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 rounded-xl bg-amber-500 text-white font-black text-xs sm:text-sm"
                  >
                    <span>Tümü Bitti!</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* --- MODAL: OUT OF MOVES (REAL LOSS) --- */}
          {status === 'game_over_moves' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Hamleler Bitti!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Hamle bütçeniz tükendi. Boşa adım atmadan önce rotayı, blokları ve lazerleri kafanızda çözmelisiniz!
                </p>
              </div>

              {/* Actionable Coach Deficit Tip Box */}
              <div className="w-full max-w-md bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Nöro-Koç Seviye Çözüm & Zorlanma Tavsiyesi:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {level.tip || 'Çıkış noktasından başlangıç noktasına doğru geriye doğru iz sürün. İlk adımı atmadan önce kilitli kapıların anahtar sırasını planlayın.'}
                </p>
                <div className="text-[10px] text-amber-400/90 font-medium pt-1 border-t border-amber-500/20">
                  💡 İpucu: Bu seviyede 3 yıldız almak için en az {level.threeStarMoves} hamle arttırmalısınız.
                </div>
              </div>

              <button
                onClick={() => initLevel(level)}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tekrar Planla & Dene</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
