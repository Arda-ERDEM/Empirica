export interface ShiftLevelData {
  levelNumber: number;
  title: string;
  targetCount: number;
  timeLimitSeconds: number;
  ruleShiftEvery: number; // Rule shifts every N correct
  hasDistractorWords: boolean;
  hasDistractorColors: boolean;
  threeStarScore: number;
  coinMultiplier: number;
  tip: string;
}

export const SHIFT_LEVELS: ShiftLevelData[] = Array.from({ length: 20 }, (_, i) => {
  const lvl = i + 1;
  const isEarly = lvl <= 5;
  const isMid = lvl > 5 && lvl <= 12;
  const isLate = lvl > 12;

  return {
    levelNumber: lvl,
    title: `Seviye ${lvl}: ${
      lvl === 1 ? 'Başlangıç Ritmi' :
      lvl === 3 ? 'Hızlı Renkler' :
      lvl === 5 ? 'İlk Kural Kayması' :
      lvl === 8 ? 'Stroop Yanılsaması' :
      lvl === 12 ? 'Çapraz Şimşek' :
      lvl === 15 ? 'Hiper-Korteks' :
      lvl === 20 ? 'Nöro-Mimar Zirvesi' :
      `Hız Protokolü ${lvl}`
    }`,
    targetCount: Math.min(35, 12 + lvl * 1),
    timeLimitSeconds: Math.max(25, 40 - Math.floor(lvl / 3)),
    ruleShiftEvery: isEarly ? 5 : isMid ? 4 : 3,
    hasDistractorWords: lvl >= 4,
    hasDistractorColors: lvl >= 7,
    threeStarScore: 1000 + lvl * 280,
    coinMultiplier: 1 + lvl * 0.2,
    tip: isEarly
      ? 'Yukarıdaki kuralı takip et ve hızlıca doğru karta tıkla!'
      : isMid
      ? 'Kural değiştiğinde tereddüt etme! Arka plan yazılarına aldanma.'
      : 'Usta seviye: Milisaniyelik refleks ve maksimum kombo!',
  };
});
