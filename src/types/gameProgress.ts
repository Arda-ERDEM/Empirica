export interface LevelProgress {
  levelNumber: number;
  unlocked: boolean;
  completed: boolean;
  stars: number; // 0 to 3 stars
  highScore: number;
  coinsEarned: number;
}

export interface GameProgressState {
  totalCoins: number;
  totalStars: number;
  currentMazeLevel: number;
  currentShiftLevel: number;
  mazeLevels: LevelProgress[];
  shiftLevels: LevelProgress[];
}
