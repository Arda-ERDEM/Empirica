'use client';

import React, { useState } from 'react';
import {
  Lightbulb,
  Award,
  X,
  Zap,
  Compass,
  CheckCircle2,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import { useCognitiveStore } from '@/store/cognitiveStore';

interface PerformanceCoachModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PerformanceCoachModal: React.FC<PerformanceCoachModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useCognitiveStore();
  const [activeTab, setActiveTab] = useState<'deficits' | 'gameTips'>('deficits');

  if (!isOpen) return null;

  const deficitDiagnoses = [
    {
      title: 'Stroop Etkisi & Çeldirici Baskısı',
      game: 'Neural Shift: Kural & Hız',
      severity: 'Gelişim Alanı',
      icon: Zap,
      finding: 'Yazı rengi ile metin anlamı çeliştiğinde tepki sürenizde ortalama 180ms gecikme gözlemlendi.',
      improvementMethod: 'Çeldirici metni iç sesinizle okumayı bırakın. Sembolün merkezine odaklanarak görsel önceliği şekle verin.',
    },
    {
      title: 'Hamle Bütçesi ve İleriye Yönelik Rota Planlaması',
      game: 'Neural Maze: Mantık Labirenti',
      severity: 'Strateji İhtiyacı',
      icon: Compass,
      finding: 'Tuzaklar ve kilitli lazer kapılarında geri adım atıldığında hamlelerin ortalama %35’i tükeniyor.',
      improvementMethod: 'Tersine Mühendislik: İlk adımınızı atmadan önce çıkış kapısından geriye doğru lazer ve anahtarları zihninizde geriye doğru takip edin.',
    },
  ];

  const gameTactics = [
    {
      gameTitle: 'Satranç: Taktik & Bilişsel Hesap',
      badge: 'Strateji',
      tips: [
        'Önce Şah Tehditleri: Rakibin şah çekişlerini ve açmazlarını ilk 3 saniyede tarayın.',
        'Açmazdaki Taşları Zorlayın: Rakibin kımıldayamayan taşlarına ikinci bir taşla yüklenin.',
      ],
    },
    {
      gameTitle: 'Neural Maze (Mantık Labirenti)',
      badge: 'Mantık',
      tips: [
        'Kutuları Köşeye Sıkıştırmayın: İtilebilir kutuların arkasında en az 1 boşluk kaldığından emin olun.',
        'Şalter Sıralaması: Kırmızı ve Mavi lazerler birbirini tersler; şalter konumunu ara durak yapın.',
      ],
    },
    {
      gameTitle: 'Neural Shift (Kural & Hız)',
      badge: 'Hız',
      tips: [
        'Ses Sinyaline Kulak Verin: Kural değiştiğinde ses efekti görselden 40ms önce algılanır.',
        'Kombo Çarpanı: Hata yapmamak acele etmekten her zaman daha çok puan kazandırır.',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-sans text-gray-900">
      <div className="relative max-w-xl w-full bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden space-y-4">
        {/* Header */}
        <div className="bg-[#1b2a47] text-white px-4 py-3 flex items-center justify-between border-b border-gray-400">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-300" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Nöro-Koç: Zorlanma Analizi & Taktikler</h3>
              <p className="text-[11px] text-slate-300">Bilişsel Antrenör Rehberi</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 pt-1 space-y-4 text-xs">
          {/* CPI Score Summary */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
            <div>
              <span className="font-bold text-amber-900 block text-xs">Performans Endeksiniz (CPI)</span>
              <span className="text-xl font-black text-amber-950 mt-0.5 block">{profile.cpiScore} Puan</span>
            </div>
            <div className="text-right">
              <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold text-[11px] inline-flex items-center gap-1 border border-amber-300">
                <Award className="w-3.5 h-3.5" />
                <span>Üst %{100 - profile.percentileRank}</span>
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('deficits')}
              className={`px-3 py-2 font-bold transition-colors border-b-2 -mb-[1px] ${
                activeTab === 'deficits'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Zorlanma Analizi</span>
              </span>
            </button>
            <button
              onClick={() => setActiveTab('gameTips')}
              className={`px-3 py-2 font-bold transition-colors border-b-2 -mb-[1px] ${
                activeTab === 'gameTips'
                  ? 'border-blue-600 text-blue-700 font-bold'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Oyun Taktikleri</span>
              </span>
            </button>
          </div>

          {/* Tab 1 */}
          {activeTab === 'deficits' && (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {deficitDiagnoses.map((diag, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{diag.title}</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded border border-amber-300">
                      {diag.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600">{diag.finding}</p>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-900 text-[11px] leading-relaxed">
                    <b>Koç Tavsiyesi:</b> {diag.improvementMethod}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2 */}
          {activeTab === 'gameTips' && (
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {gameTactics.map((gt, idx) => (
                <div key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{gt.gameTitle}</span>
                    <span className="text-[10px] bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded">
                      {gt.badge}
                    </span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-600">
                    {gt.tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs border border-gray-300 transition-colors"
            >
              Kapat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
