'use client';

import React, { useState } from 'react';
import { useGameStore, GameId } from '@/store/gameStore';
import { ALL_GAMES, GameDefinition } from '@/config/gamesRegistry';
import { ChessGame } from '@/components/game/ChessGame';
import { LogicMazeGame } from '@/components/game/LogicMazeGame';
import { NeuroShiftArcade } from '@/components/game/NeuroShiftArcade';
import { PatternMatrixGame } from '@/components/game/PatternMatrixGame';
import { FocusTrackerGame } from '@/components/game/FocusTrackerGame';
import { DualTaskGame } from '@/components/game/DualTaskGame';
import { SpeedMathGame } from '@/components/game/SpeedMathGame';
import { CognitiveArcadeRunner } from '@/components/game/CognitiveArcadeRunner';
import { LevelSelectModal } from '@/components/game/LevelSelectModal';
import { GameErrorBoundary } from '@/components/game/GameErrorBoundary';
import { StreakFreezeModal } from '@/components/game/StreakFreezeModal';
import { CustomWorkoutModal } from '@/components/game/CustomWorkoutModal';
import { PerformanceCoachModal } from '@/components/coaching/PerformanceCoachModal';
import { SocialLeaderboardModal } from '@/components/social/SocialLeaderboardModal';
import { NotificationSettingsModal } from '@/components/notifications/NotificationSettingsModal';

import {
  Play,
  Grid,
  Star,
  Coins,
  Brain,
  RotateCcw,
  Sparkles,
  Snowflake,
  SlidersHorizontal,
  Lightbulb,
  Users,
  Bell,
  Flame,
  Crown,
  LayoutDashboard,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function EmpiricaBlazorPortalHome() {
  const {
    totalCoins,
    totalStars,
    getGameLevels,
    getSelectedLevel,
    selectGameLevel,
    resetGameProgress,
    streakFreezes,
    streakDays,
  } = useGameStore();

  // Active game modal state
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  // Level selector modal state
  const [levelSelectGame, setLevelSelectGame] = useState<GameId | null>(null);

  // Category filter state
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'chess' | 'logic' | 'speed' | 'memory' | 'attention' | 'dual' | 'math'
  >('all');

  // Feedback feature modals
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [customWorkoutOpen, setCustomWorkoutOpen] = useState(false);
  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);

  // Calculate total completed levels across all 21 games
  let totalCompleted = 0;
  ALL_GAMES.forEach((g) => {
    const lvls = getGameLevels(g.id);
    totalCompleted += lvls.filter((l) => l.completed).length;
  });

  const filteredGames =
    selectedFilter === 'all'
      ? ALL_GAMES
      : selectedFilter === 'chess'
      ? ALL_GAMES.filter((c) => c.id === 'chess')
      : ALL_GAMES.filter((c) => c.category === selectedFilter && c.id !== 'chess');

  const activeGameDef = ALL_GAMES.find((g) => g.id === activeGame);
  const levelSelectGameDef = ALL_GAMES.find((g) => g.id === levelSelectGame);

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-gray-800 flex flex-col md:flex-row font-sans selection:bg-blue-600 selection:text-white">
      {/* ============================================================ */}
      {/* KLASİK BLAZOR SOL MENÜ PANELİ (ASP.NET BLAZOR NAVMENU) */}
      {/* ============================================================ */}
      <aside className="w-full md:w-64 bg-[#1b2a47] text-slate-200 flex flex-col justify-between shrink-0 shadow-lg border-r border-[#121c30]">
        <div>
          {/* Logo & Portal Info */}
          <div className="h-16 px-4 flex items-center gap-3 border-b border-slate-700/60 bg-[#142036]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-amber-950 flex items-center justify-center shadow-md shadow-amber-500/20 border border-amber-300/60">
              <Crown className="w-5 h-5 text-amber-950 fill-amber-950/25" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide text-white block">EMPIRICA</span>
              <span className="text-[10px] text-slate-400 block -mt-0.5 font-medium">
                Bilişsel Antrenman Portalı
              </span>
            </div>
          </div>

          {/* Navigation Items (Classic Blazor Links) */}
          <nav className="p-3 space-y-1 text-xs">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Tüm Egzersizler</span>
              </div>
              <span className="text-[10px] bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300">
                21
              </span>
            </button>

            {/* Quick Chess Navigation */}
            <button
              onClick={() => setActiveGame('chess')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded font-medium text-amber-300 hover:bg-slate-800 hover:text-amber-200 transition-colors bg-amber-500/10 border border-amber-500/20"
            >
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Satranç Masası</span>
              </div>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                YENİ
              </span>
            </button>

            <button
              onClick={() => setCustomWorkoutOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-purple-400" />
              <span>Günlük Rotasyon</span>
            </button>

            <button
              onClick={() => setCoachModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Bilişsel Koçluk</span>
            </button>

            <button
              onClick={() => setSocialModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Liderlik Tablosu</span>
            </button>

            <button
              onClick={() => setNotificationModalOpen(true)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Bell className="w-4 h-4 text-sky-400" />
              <span>Hatırlatıcı Ayarları</span>
            </button>

            <button
              onClick={() => setStreakModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Snowflake className="w-4 h-4 text-cyan-400" />
                <span>Seri Dondurma</span>
              </div>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-bold">
                {streakFreezes} Hak
              </span>
            </button>

            <button
              onClick={() => {
                if (confirm('Tüm egzersiz ilerlemesini sıfırlamak istiyor musunuz?')) {
                  resetGameProgress();
                }
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded font-medium text-slate-400 hover:bg-slate-800 hover:text-rose-300 transition-colors pt-3"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>İlerlemeyi Sıfırla</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer System Tag */}
        <div className="p-3 border-t border-slate-700/60 text-[11px] text-slate-400 bg-[#142036]">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-0.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aktif Oturum Korumalı</span>
          </div>
          <span>Empirica Platform v2.8.4</span>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* SAĞ ANA ALAN (HEADER + CONTENT) */}
      {/* ============================================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* KLASİK BEYAZ BREADCRUMB / ÜST BİLGİ ÇUBUĞU */}
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between shadow-sm sticky top-0 z-20">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            <span className="hover:text-blue-600 cursor-pointer">Ana Sayfa</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="hover:text-blue-600 cursor-pointer">Bilişsel Egzersizler</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-900 font-bold">Katalog (21 Oyun)</span>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>{streakDays} Gün Seri</span>
            </div>

            {/* Coins */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-bold shadow-sm">
              <Coins className="w-3.5 h-3.5 text-yellow-600 fill-yellow-500" />
              <span>{totalCoins.toLocaleString()} 🪙</span>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold shadow-sm">
              <Star className="w-3.5 h-3.5 text-blue-600 fill-blue-500" />
              <span>{totalStars} ⭐</span>
            </div>
          </div>
        </header>

        {/* ANA İÇERİK GÖVDESİ */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          
          {/* Sayfa Başlığı ve Açıklama Paneli */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                Bilişsel Antrenman Kataloğu & Satranç Masası
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                21 farklı bilimsel nöroplastisite egzersizi, gerçek tahta satranç ve 420 aşamalı seviye.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setActiveGame('chess')}
                className="px-4 py-2 bg-[#b45309] hover:bg-[#92400e] text-white text-xs font-bold rounded shadow flex items-center gap-1.5 transition-colors"
              >
                <Crown className="w-4 h-4" />
                <span>Satrancı Aç</span>
              </button>
              <button
                onClick={() => setCustomWorkoutOpen(true)}
                className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                <span>Rotasyon</span>
              </button>
            </div>
          </div>

          {/* KLASİK BOOTSTRAP / BLAZOR NAVTABS (SEKMELER) */}
          <div className="border-b border-gray-300 flex items-center gap-1 overflow-x-auto text-xs font-semibold scrollbar-none">
            {[
              { id: 'all', name: 'Tüm Egzersizler (21)' },
              { id: 'chess', name: '♟️ Satranç & Taktik (1)' },
              { id: 'logic', name: 'Mantık & Rota (4)' },
              { id: 'speed', name: 'Hız & Refleks (4)' },
              { id: 'memory', name: 'Hafıza & Mekân (4)' },
              { id: 'attention', name: 'Dikkat & Odak (4)' },
              { id: 'dual', name: 'Dual Task & Esneklik (2)' },
              { id: 'math', name: 'Sayısal Mantık (2)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-4 py-2.5 transition-colors whitespace-nowrap border-b-2 -mb-[1px] ${
                  selectedFilter === tab.id
                    ? 'border-blue-600 text-blue-700 bg-white rounded-t font-bold shadow-sm'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* 21 OYUN KARTI GRİDİ (GERÇEK FOTOĞRAFLI & BLAZOR KART TASARIMI) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGames.map((card) => {
              const levels = getGameLevels(card.id);
              const selectedLevel = getSelectedLevel(card.id);
              const completedCount = levels.filter((l) => l.completed).length;
              const progressPct = Math.round((completedCount / 20) * 100);

              return (
                <div
                  key={card.id}
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    {/* GERÇEK OYUN FOTOĞRAFI BAŞLIĞI */}
                    <div className="relative w-full h-44 bg-gray-100 overflow-hidden border-b border-gray-200">
                      <img
                        src={card.imageUrl}
                        alt={card.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      {/* Badge Over Photo */}
                      <div className="absolute top-2.5 left-2.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow-sm border ${card.badgeBg} ${card.badgeText}`}>
                          {card.badge}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                        20 Seviye
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {card.title}
                        </h2>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed line-clamp-2">
                          {card.desc}
                        </p>
                      </div>

                      {/* Progress Bar & Stats (Classic Bootstrap Style) */}
                      <div className="bg-gray-50 p-2.5 rounded border border-gray-200 space-y-1.5 text-xs">
                        <div className="flex justify-between text-gray-700">
                          <span className="font-medium text-gray-600">İlerleme:</span>
                          <span className="font-bold text-blue-700">
                            Seviye {selectedLevel} / 20 ({completedCount} Tamamlandı)
                          </span>
                        </div>

                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[11px] text-gray-500 pt-0.5">
                          <span className="truncate mr-2">{card.features}</span>
                          <span className="font-bold text-amber-700 shrink-0">{card.bonus}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar (Classic Buttons) */}
                  <div className="p-4 pt-0 flex items-center gap-2">
                    <button
                      onClick={() => setLevelSelectGame(card.id)}
                      className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1 shadow-xs"
                      title="Seviye Listesi"
                    >
                      <Grid className="w-3.5 h-3.5" />
                      <span>Seviyeler</span>
                    </button>

                    <button
                      onClick={() => setActiveGame(card.id)}
                      className="flex-1 py-2 px-3 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-xs rounded transition-colors shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Seviye {selectedLevel}'i Başlat</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SADE ALT BİLGİ PANELİ (ENTERPRISE STATUS) */}
          <div className="p-4 rounded-lg bg-white border border-gray-200 text-xs text-gray-600 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Tüm 21 egzersiz oturumu Error Boundary ve yerel durum yönetim koruması altındadır.
              </span>
            </div>

            <div className="font-bold text-gray-800">
              Toplam 420 Egzersiz Seviyesi ({totalCompleted} / 420 Tamamlandı)
            </div>
          </div>

        </main>
      </div>

      {/* FEEDBACK-DRIVEN MODALS */}
      <StreakFreezeModal
        isOpen={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
      />

      <CustomWorkoutModal
        isOpen={customWorkoutOpen}
        onClose={() => setCustomWorkoutOpen(false)}
        onSelectGameMode={(mode) => setActiveGame(mode)}
      />

      <PerformanceCoachModal
        isOpen={coachModalOpen}
        onClose={() => setCoachModalOpen(false)}
      />

      <SocialLeaderboardModal
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
      />

      <NotificationSettingsModal
        isOpen={notificationModalOpen}
        onClose={() => setNotificationModalOpen(false)}
      />

      {/* LEVEL SELECT MODAL (SUPPORTING ALL 21 GAMES) */}
      <LevelSelectModal
        isOpen={levelSelectGame !== null}
        onClose={() => setLevelSelectGame(null)}
        gameTitle={levelSelectGameDef?.title || ''}
        gameType={levelSelectGame || 'maze'}
        levels={levelSelectGame ? getGameLevels(levelSelectGame) : []}
        currentLevel={levelSelectGame ? getSelectedLevel(levelSelectGame) : 1}
        onSelectLevel={(lvl) => {
          if (levelSelectGame) {
            selectGameLevel(levelSelectGame, lvl);
            setActiveGame(levelSelectGame);
          }
        }}
      />

      {/* ============================================================ */}
      {/* GAME MODAL POPUPS */}
      {/* ============================================================ */}
      
      {/* GAME 0: CHESS (SATRANÇ) */}
      {activeGame === 'chess' && (
        <GameErrorBoundary onReset={() => setActiveGame(null)}>
          <ChessGame
            onClose={() => setActiveGame(null)}
            onOpenLevelSelect={() => {
              setActiveGame(null);
              setLevelSelectGame('chess');
            }}
          />
        </GameErrorBoundary>
      )}

      {/* GAME 1: LOGIC MAZE */}
      {activeGame === 'maze' && (
        <GameErrorBoundary onReset={() => setActiveGame(null)}>
          <LogicMazeGame
            onClose={() => setActiveGame(null)}
            onOpenLevelSelect={() => {
              setActiveGame(null);
              setLevelSelectGame('maze');
            }}
          />
        </GameErrorBoundary>
      )}

      {/* GAME 2: NEURAL SHIFT */}
      {activeGame === 'shift' && (
        <GameErrorBoundary onReset={() => setActiveGame(null)}>
          <NeuroShiftArcade
            onClose={() => setActiveGame(null)}
            onOpenLevelSelect={() => {
              setActiveGame(null);
              setLevelSelectGame('shift');
            }}
          />
        </GameErrorBoundary>
      )}

      {/* GAME 3: PATTERN MATRIX */}
      {activeGame === 'pattern' && (
        <GameErrorBoundary onReset={() => setActiveGame(null)}>
          <PatternMatrixGame
            onClose={() => setActiveGame(null)}
            onOpenLevelSelect={() => {
              setActiveGame(null);
              setLevelSelectGame('pattern');
            }}
          />
        </GameErrorBoundary>
      )}

      {/* GAME 4: FOCUS FLASH */}
      {activeGame === 'focus' && (
        <GameErrorBoundary onReset={() => setActiveGame(null)}>
          <FocusTrackerGame
            onClose={() => setActiveGame(null)}
            onOpenLevelSelect={() => {
              setActiveGame(null);
              setLevelSelectGame('focus');
            }}
          />
        </GameErrorBoundary>
      )}

      {/* GAME 5: DUAL TASK */}
      {activeGame === 'dual' && (
        <GameErrorBoundary onReset={() => setActiveGame(null)}>
          <DualTaskGame
            onClose={() => setActiveGame(null)}
            onOpenLevelSelect={() => {
              setActiveGame(null);
              setLevelSelectGame('dual');
            }}
          />
        </GameErrorBoundary>
      )}

      {/* GAME 6: SPEED MATH */}
      {activeGame === 'math' && (
        <GameErrorBoundary onReset={() => setActiveGame(null)}>
          <SpeedMathGame
            onClose={() => setActiveGame(null)}
            onOpenLevelSelect={() => {
              setActiveGame(null);
              setLevelSelectGame('math');
            }}
          />
        </GameErrorBoundary>
      )}

      {/* MODULAR ARCADE RUNNER FOR THE REMAINING GAMES */}
      {activeGame &&
        !['chess', 'maze', 'shift', 'pattern', 'focus', 'dual', 'math'].includes(activeGame) &&
        activeGameDef && (
          <GameErrorBoundary onReset={() => setActiveGame(null)}>
            <CognitiveArcadeRunner
              gameId={activeGame}
              gameTitle={activeGameDef.title}
              gameBadge={activeGameDef.badge}
              gameColor={activeGameDef.accentColor}
              onClose={() => setActiveGame(null)}
              onOpenLevelSelect={() => {
                const target = activeGame;
                setActiveGame(null);
                setLevelSelectGame(target);
              }}
            />
          </GameErrorBoundary>
        )}
    </div>
  );
}
