export type CognitiveDomain = 
  | 'attention' 
  | 'flexibility' 
  | 'memory' 
  | 'speed' 
  | 'problemSolving';

export interface DomainScore {
  domain: CognitiveDomain;
  title: string;
  shortDesc: string;
  score: number; // 0 - 100
  benchmark: number; // Yaşıt ortalaması
  trend: number; // Örn +6.4%
  levelTitle: string; // "Usta", "İleri", "Gelişmekte" vb.
  color: string;
  accentBg: string;
  iconName: string;
  farTransferBenefit: string; // Gerçek hayattaki karşılığı
  practicalApplication: string;
}

export interface FarTransferMetric {
  id: string;
  domain: CognitiveDomain;
  skillName: string;
  realWorldImpact: string;
  gainPercentage: number;
  benchmarkContext: string;
  evidenceBasedNote: string;
}

export interface AntiPlateauTelemetry {
  adaptationIndex: number; // 0 - 100 (Ne kadar zorlandı ve yeni nöral yollar açıldı)
  muscleMemoryMitigation: number; // % kas hafızası kırılma oranı
  currentRuleEntropy: 'Düşük' | 'Orta' | 'Yüksek' | 'Hiper-Dinamik';
  distractorResistance: number; // %
  lastIntervention: string;
}

export interface GameSessionResult {
  id: string;
  gameId: string;
  gameTitle: string;
  domain: CognitiveDomain;
  timestamp: string;
  score: number;
  accuracy: number; // 0 - 100 %
  averageReactionTimeMs: number; // ms
  peakStreak: number;
  difficultyReached: number; // Seviye 1 - 10
  ruleShiftsHandled: number;
  plateauBreakerBonus: number;
  breakdown: {
    ruleSwitchErrors: number;
    distractorErrors: number;
    speedVsAccuracyBalance: string;
    cognitiveFatigueOnsetMs: number;
  };
  farTransferFeedback: string;
}

export interface UserCognitiveProfile {
  name: string;
  cpiScore: number; // Cognitive Performance Index (0 - 1000)
  percentileRank: number; // %94 vb.
  streakDays: number;
  totalSessions: number;
  totalTrainingMinutes: number;
  antiPlateau: AntiPlateauTelemetry;
  domains: Record<CognitiveDomain, DomainScore>;
  recentSessions: GameSessionResult[];
  transferInsights: FarTransferMetric[];
}
