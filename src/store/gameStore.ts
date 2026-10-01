import { create } from 'zustand';
import { LevelProgress } from '@/types/gameProgress';

const TOTAL_LEVELS = 20;

export const ALL_GAME_IDS = [
  'chess',
  'maze',
  'shift',
  'pattern',
  'focus',
  'dual',
  'math',
  'color-rush',
  'sequence',
  'subitizing',
  'chrono',
  'traffic',
  'switch-task',
  'radar',
  'circuit',
  'syllogism',
  'tower',
  'spatial',
  'word-pair',
  'peripheral',
  'estimate',
] as const;

export type GameId = typeof ALL_GAME_IDS[number];

export const createInitialLevels = (): LevelProgress[] => {
  return Array.from({ length: TOTAL_LEVELS }, (_, i) => ({
    levelNumber: i + 1,
    unlocked: i === 0, // Level 1 is always unlocked
    completed: false,
    stars: 0,
    highScore: 0,
    coinsEarned: 0,
  }));
};

interface GameStoreState {
  totalCoins: number;
  totalStars: number;

  // Generic 20-Game mapping
  levelsByGame: Record<string, LevelProgress[]>;
  selectedLevelByGame: Record<string, number>;
  getGameLevels: (gameId: string) => LevelProgress[];
  getSelectedLevel: (gameId: string) => number;
  selectGameLevel: (gameId: string, lvl: number) => void;
  completeGameLevel: (gameId: string, levelNum: number, starsEarned: number, score: number, coins: number) => void;

  // Backwards compatible individual states
  selectedMazeLevel: number;
  mazeLevels: LevelProgress[];
  selectMazeLevel: (lvl: number) => void;
  completeMazeLevel: (levelNum: number, starsEarned: number, score: number, coins: number) => void;

  selectedShiftLevel: number;
  shiftLevels: LevelProgress[];
  selectShiftLevel: (lvl: number) => void;
  completeShiftLevel: (levelNum: number, starsEarned: number, score: number, coins: number) => void;

  selectedPatternLevel: number;
  patternLevels: LevelProgress[];
  selectPatternLevel: (lvl: number) => void;
  completePatternLevel: (levelNum: number, starsEarned: number, score: number, coins: number) => void;

  selectedFocusLevel: number;
  focusLevels: LevelProgress[];
  selectFocusLevel: (lvl: number) => void;
  completeFocusLevel: (levelNum: number, starsEarned: number, score: number, coins: number) => void;

  selectedDualLevel: number;
  dualLevels: LevelProgress[];
  selectDualLevel: (lvl: number) => void;
  completeDualLevel: (levelNum: number, starsEarned: number, score: number, coins: number) => void;

  selectedMathLevel: number;
  mathLevels: LevelProgress[];
  selectMathLevel: (lvl: number) => void;
  completeMathLevel: (levelNum: number, starsEarned: number, score: number, coins: number) => void;

  // Feedback-driven new states
  streakFreezes: number;
  streakDays: number;
  notificationEnabled: boolean;
  notificationTime: string;

  addCoins: (amount: number) => void;
  buyStreakFreeze: () => boolean;
  useStreakFreeze: () => boolean;
  setNotificationSettings: (enabled: boolean, time: string) => void;
  resetGameProgress: () => void;
}

const STORAGE_KEY = 'empirica_game_progression_v4';

const calculateLevelUpdate = (
  levels: LevelProgress[],
  levelNum: number,
  starsEarned: number,
  score: number,
  coins: number
) => {
  return levels.map((lvl) => {
    if (lvl.levelNumber === levelNum) {
      return {
        ...lvl,
        completed: true,
        stars: Math.max(lvl.stars, starsEarned),
        highScore: Math.max(lvl.highScore, score),
        coinsEarned: lvl.coinsEarned + coins,
      };
    }
    if (lvl.levelNumber === levelNum + 1) {
      return { ...lvl, unlocked: true };
    }
    return lvl;
  });
};

const createInitialAllGames = () => {
  const map: Record<string, LevelProgress[]> = {};
  ALL_GAME_IDS.forEach((id) => {
    map[id] = createInitialLevels();
  });
  return map;
};

const createInitialSelectedLevels = () => {
  const map: Record<string, number> = {};
  ALL_GAME_IDS.forEach((id) => {
    map[id] = 1;
  });
  return map;
};

export const useGameStore = create<GameStoreState>((set, get) => {
  const initialLevelsMap = createInitialAllGames();
  const initialSelectedLevels = createInitialSelectedLevels();

  const persist = (data: Partial<GameStoreState>) => {
    if (typeof window !== 'undefined') {
      try {
        const fullState = { ...get(), ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));
      } catch {}
    }
  };

  return {
    totalCoins: 200,
    totalStars: 0,
    streakFreezes: 2,
    streakDays: 14,
    notificationEnabled: true,
    notificationTime: '09:00',

    levelsByGame: initialLevelsMap,
    selectedLevelByGame: initialSelectedLevels,

    getGameLevels: (gameId) => {
      const state = get();
      return state.levelsByGame[gameId] || createInitialLevels();
    },

    getSelectedLevel: (gameId) => {
      const state = get();
      return state.selectedLevelByGame[gameId] || 1;
    },

    selectGameLevel: (gameId, lvl) => {
      set((state) => {
        const updatedSelected = { ...state.selectedLevelByGame, [gameId]: lvl };
        const updates: any = { selectedLevelByGame: updatedSelected };

        // Keep backwards compatible fields synced
        if (gameId === 'maze') updates.selectedMazeLevel = lvl;
        if (gameId === 'shift') updates.selectedShiftLevel = lvl;
        if (gameId === 'pattern') updates.selectedPatternLevel = lvl;
        if (gameId === 'focus') updates.selectedFocusLevel = lvl;
        if (gameId === 'dual') updates.selectedDualLevel = lvl;
        if (gameId === 'math') updates.selectedMathLevel = lvl;

        persist(updates);
        return updates;
      });
    },

    completeGameLevel: (gameId, levelNum, starsEarned, score, coins) => {
      set((state) => {
        const currentLevels = state.levelsByGame[gameId] || createInitialLevels();
        const updated = calculateLevelUpdate(currentLevels, levelNum, starsEarned, score, coins);
        const nextLevel = Math.min(TOTAL_LEVELS, levelNum + 1);

        const updatedLevelsByGame = {
          ...state.levelsByGame,
          [gameId]: updated,
        };

        const updatedSelectedLevelByGame = {
          ...state.selectedLevelByGame,
          [gameId]: nextLevel,
        };

        // Recalculate total stars across all games
        let newTotalStars = 0;
        Object.values(updatedLevelsByGame).forEach((arr) => {
          if (arr) {
            newTotalStars += arr.reduce((acc, l) => acc + l.stars, 0);
          }
        });

        const newTotalCoins = state.totalCoins + coins;

        const updates: any = {
          levelsByGame: updatedLevelsByGame,
          selectedLevelByGame: updatedSelectedLevelByGame,
          totalCoins: newTotalCoins,
          totalStars: newTotalStars,
        };

        // Sync legacy keys
        if (gameId === 'maze') {
          updates.mazeLevels = updated;
          updates.selectedMazeLevel = nextLevel;
        } else if (gameId === 'shift') {
          updates.shiftLevels = updated;
          updates.selectedShiftLevel = nextLevel;
        } else if (gameId === 'pattern') {
          updates.patternLevels = updated;
          updates.selectedPatternLevel = nextLevel;
        } else if (gameId === 'focus') {
          updates.focusLevels = updated;
          updates.selectedFocusLevel = nextLevel;
        } else if (gameId === 'dual') {
          updates.dualLevels = updated;
          updates.selectedDualLevel = nextLevel;
        } else if (gameId === 'math') {
          updates.mathLevels = updated;
          updates.selectedMathLevel = nextLevel;
        }

        persist(updates);
        return updates;
      });
    },

    // Backwards-compatible fields
    selectedMazeLevel: 1,
    mazeLevels: initialLevelsMap['maze'],
    selectMazeLevel: (lvl) => get().selectGameLevel('maze', lvl),
    completeMazeLevel: (levelNum, starsEarned, score, coins) =>
      get().completeGameLevel('maze', levelNum, starsEarned, score, coins),

    selectedShiftLevel: 1,
    shiftLevels: initialLevelsMap['shift'],
    selectShiftLevel: (lvl) => get().selectGameLevel('shift', lvl),
    completeShiftLevel: (levelNum, starsEarned, score, coins) =>
      get().completeGameLevel('shift', levelNum, starsEarned, score, coins),

    selectedPatternLevel: 1,
    patternLevels: initialLevelsMap['pattern'],
    selectPatternLevel: (lvl) => get().selectGameLevel('pattern', lvl),
    completePatternLevel: (levelNum, starsEarned, score, coins) =>
      get().completeGameLevel('pattern', levelNum, starsEarned, score, coins),

    selectedFocusLevel: 1,
    focusLevels: initialLevelsMap['focus'],
    selectFocusLevel: (lvl) => get().selectGameLevel('focus', lvl),
    completeFocusLevel: (levelNum, starsEarned, score, coins) =>
      get().completeGameLevel('focus', levelNum, starsEarned, score, coins),

    selectedDualLevel: 1,
    dualLevels: initialLevelsMap['dual'],
    selectDualLevel: (lvl) => get().selectGameLevel('dual', lvl),
    completeDualLevel: (levelNum, starsEarned, score, coins) =>
      get().completeGameLevel('dual', levelNum, starsEarned, score, coins),

    selectedMathLevel: 1,
    mathLevels: initialLevelsMap['math'],
    selectMathLevel: (lvl) => get().selectGameLevel('math', lvl),
    completeMathLevel: (levelNum, starsEarned, score, coins) =>
      get().completeGameLevel('math', levelNum, starsEarned, score, coins),

    addCoins: (amount) =>
      set((state) => {
        const updatedCoins = state.totalCoins + amount;
        persist({ totalCoins: updatedCoins });
        return { totalCoins: updatedCoins };
      }),

    buyStreakFreeze: () => {
      const state = get();
      if (state.totalCoins >= 50) {
        const newState = {
          totalCoins: state.totalCoins - 50,
          streakFreezes: state.streakFreezes + 1,
        };
        set(newState);
        persist(newState);
        return true;
      }
      return false;
    },

    useStreakFreeze: () => {
      const state = get();
      if (state.streakFreezes > 0) {
        const newState = { streakFreezes: state.streakFreezes - 1 };
        set(newState);
        persist(newState);
        return true;
      }
      return false;
    },

    setNotificationSettings: (enabled, time) => {
      const newState = { notificationEnabled: enabled, notificationTime: time };
      set(newState);
      persist(newState);
    },

    resetGameProgress: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      const resetMap = createInitialAllGames();
      const resetSelected = createInitialSelectedLevels();
      set({
        totalCoins: 200,
        totalStars: 0,
        levelsByGame: resetMap,
        selectedLevelByGame: resetSelected,
        selectedMazeLevel: 1,
        selectedShiftLevel: 1,
        selectedPatternLevel: 1,
        selectedFocusLevel: 1,
        selectedDualLevel: 1,
        selectedMathLevel: 1,
        mazeLevels: resetMap['maze'],
        shiftLevels: resetMap['shift'],
        patternLevels: resetMap['pattern'],
        focusLevels: resetMap['focus'],
        dualLevels: resetMap['dual'],
        mathLevels: resetMap['math'],
      });
    },
  };
});
