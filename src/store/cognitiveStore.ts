import { create } from 'zustand';
import { UserCognitiveProfile, GameSessionResult, CognitiveDomain } from '@/types/cognitive';
import { initialCognitiveProfile } from '@/data/mockCognitiveData';

interface CognitiveState {
  profile: UserCognitiveProfile;
  selectedDomain: CognitiveDomain | 'all';
  activeGameModal: boolean;
  setSelectedDomain: (domain: CognitiveDomain | 'all') => void;
  openGameModal: () => void;
  closeGameModal: () => void;
  recordSessionResult: (result: GameSessionResult) => void;
  resetProgress: () => void;
}

const LOCAL_STORAGE_KEY = 'empirica_cognitive_profile_v1';

export const useCognitiveStore = create<CognitiveState>((set) => ({
  profile: initialCognitiveProfile,
  selectedDomain: 'all',
  activeGameModal: false,

  setSelectedDomain: (domain) => set({ selectedDomain: domain }),
  
  openGameModal: () => set({ activeGameModal: true }),
  closeGameModal: () => set({ activeGameModal: false }),

  recordSessionResult: (newSession) =>
    set((state) => {
      const prevDomain = state.profile.domains[newSession.domain];
      
      // Calculate updated score for domain
      const scoreDelta = Math.round((newSession.score - 1000) / 40);
      const updatedScore = Math.min(99, Math.max(40, prevDomain.score + (scoreDelta > 0 ? Math.min(scoreDelta, 3) : Math.max(scoreDelta, -2))));
      
      // Calculate updated CPI (Cognitive Performance Index)
      const newCpi = Math.min(999, Math.max(200, state.profile.cpiScore + Math.round(newSession.score / 120)));

      const updatedProfile: UserCognitiveProfile = {
        ...state.profile,
        cpiScore: newCpi,
        totalSessions: state.profile.totalSessions + 1,
        totalTrainingMinutes: state.profile.totalTrainingMinutes + 3,
        antiPlateau: {
          ...state.profile.antiPlateau,
          adaptationIndex: Math.min(99, state.profile.antiPlateau.adaptationIndex + 2),
          muscleMemoryMitigation: Math.min(99, state.profile.antiPlateau.muscleMemoryMitigation + 1),
          distractorResistance: Math.min(99, Math.round((state.profile.antiPlateau.distractorResistance + newSession.accuracy) / 2)),
          lastIntervention: `Son Seans: ${newSession.ruleShiftsHandled} kural değişimi başarıyla yönetildi, adaptasyon katsayısı +%${newSession.difficultyReached * 2}`,
        },
        domains: {
          ...state.profile.domains,
          [newSession.domain]: {
            ...prevDomain,
            score: updatedScore,
            trend: +(prevDomain.trend + 0.5).toFixed(1),
          },
        },
        recentSessions: [newSession, ...state.profile.recentSessions.slice(0, 9)],
      };

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedProfile));
        } catch {
          // localStorage error handling
        }
      }

      return { profile: updatedProfile };
    }),

  resetProgress: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    set({ profile: initialCognitiveProfile });
  },
}));
