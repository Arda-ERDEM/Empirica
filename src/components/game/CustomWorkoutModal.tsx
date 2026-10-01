'use client';

import React, { useState } from 'react';
import {
  Shuffle,
  X,
  SlidersHorizontal,
  Sparkles,
  Play,
} from 'lucide-react';
import { ALL_GAMES } from '@/config/gamesRegistry';
import { GameId } from '@/store/gameStore';

interface CustomWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGameMode: (mode: GameId) => void;
}

export const CustomWorkoutModal: React.FC<CustomWorkoutModalProps> = ({
  isOpen,
  onClose,
  onSelectGameMode,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'all' | 'logic' | 'speed' | 'memory' | 'attention' | 'dual' | 'math'
  >('all');
  const [rotationActive, setRotationActive] = useState(true);

  if (!isOpen) return null;

  const filteredGames =
    selectedCategory === 'all'
      ? ALL_GAMES
      : ALL_GAMES.filter((g) => g.category === selectedCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm font-sans text-gray-900">
      <div className="relative max-w-2xl w-full bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden space-y-4">
        {/* Classic Blazor Header */}
        <div className="bg-[#1b2a47] text-white px-4 py-3 flex items-center justify-between border-b border-gray-400">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-blue-300" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Günlük Antrenman & Rotasyon Paneli</h3>
              <p className="text-[11px] text-slate-300">21 Bilişsel Egzersiz Arasından Seçim Yap veya Rotasyonu Çalıştır</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-5 space-y-4">
          {/* Rotation Toggle Banner */}
          <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Shuffle className="w-4 h-4 text-blue-700" />
              <div>
                <span className="font-bold text-blue-900 block">Otomatik Günlük Rotasyon</span>
                <span className="text-[11px] text-blue-700">Her gün 21 farklı nöroplastisite egzersizinden 5 tanesi seçilir</span>
              </div>
            </div>
            <button
              onClick={() => setRotationActive(!rotationActive)}
              className={`px-3 py-1.5 rounded font-bold text-xs transition-colors border ${
                rotationActive
                  ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {rotationActive ? 'Aktif ✓' : 'Kapalı'}
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {[
              { id: 'all', name: 'Tüm Oyunlar (21)' },
              { id: 'logic', name: 'Mantık & Satranç' },
              { id: 'speed', name: 'Hız' },
              { id: 'memory', name: 'Hafıza' },
              { id: 'attention', name: 'Dikkat' },
              { id: 'dual', name: 'Dual Task' },
              { id: 'math', name: 'Sayısal' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-1.5 rounded font-medium transition-colors shrink-0 border ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                    : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Game List with Real Thumbnails */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {filteredGames.map((game) => {
              return (
                <div
                  key={game.id}
                  className="p-2.5 rounded-lg bg-white border border-gray-200 hover:border-blue-400 flex items-center justify-between gap-3 transition-colors shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={game.imageUrl}
                      alt={game.title}
                      className="w-12 h-12 rounded object-cover border border-gray-200 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-gray-900 truncate">{game.title}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border shrink-0 ${game.badgeBg} ${game.badgeText}`}>
                          {game.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{game.desc}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      onSelectGameMode(game.id);
                    }}
                    className="py-1.5 px-3 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Başlat</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors border border-gray-300"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
