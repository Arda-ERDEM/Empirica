'use client';

import React, { useState } from 'react';
import { Users, Trophy, Share2, Swords, X } from 'lucide-react';
import { useCognitiveStore } from '@/store/cognitiveStore';

interface SocialLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialLeaderboardModal: React.FC<SocialLeaderboardModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useCognitiveStore();
  const [invited, setInvited] = useState<string[]>([]);

  if (!isOpen) return null;

  const friends = [
    { rank: 1, name: 'Selin Yılmaz', cpi: 890, streak: 42, avatar: '👩‍🔬', isUser: false },
    { rank: 2, name: `${profile.name} (Siz)`, cpi: profile.cpiScore, streak: profile.streakDays, avatar: '🧠', isUser: true },
    { rank: 3, name: 'Caner Demir', cpi: 745, streak: 19, avatar: '👨‍💻', isUser: false },
    { rank: 4, name: 'Elif Kaya', cpi: 710, streak: 8, avatar: '👩‍🎨', isUser: false },
  ];

  const handleChallenge = (friendName: string) => {
    if (!invited.includes(friendName)) {
      setInvited([...invited, friendName]);
      alert(`${friendName} kullanıcısına Hız Meydan Okuması gönderildi! ⚔️`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-sans text-gray-900">
      <div className="relative max-w-xl w-full bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden space-y-4">
        {/* Classic Blazor Header */}
        <div className="bg-[#1b2a47] text-white px-4 py-3 flex items-center justify-between border-b border-gray-400">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Sosyal Liderlik & Skor Tablosu</h3>
              <p className="text-[11px] text-slate-300">Bilişsel Performans Endeksi (CPI) Sıralaması</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 pt-1 space-y-4 text-xs">
          {/* Table */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left">
              <thead className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Sıra</th>
                  <th className="py-2.5 px-3">Kullanıcı</th>
                  <th className="py-2.5 px-3">CPI Skoru</th>
                  <th className="py-2.5 px-3">Seri</th>
                  <th className="py-2.5 px-3 text-right">Eylem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-gray-800">
                {friends.map((friend) => (
                  <tr
                    key={friend.name}
                    className={friend.isUser ? 'bg-blue-50/60 font-semibold' : 'hover:bg-gray-50'}
                  >
                    <td className="py-2.5 px-3">
                      {friend.rank === 1 ? '🥇 1' : friend.rank === 2 ? '🥈 2' : friend.rank === 3 ? '🥉 3' : friend.rank}
                    </td>
                    <td className="py-2.5 px-3 flex items-center gap-2">
                      <span className="text-base">{friend.avatar}</span>
                      <span>{friend.name}</span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-blue-700">{friend.cpi}</td>
                    <td className="py-2.5 px-3">{friend.streak} Gün</td>
                    <td className="py-2.5 px-3 text-right">
                      {!friend.isUser ? (
                        <button
                          onClick={() => handleChallenge(friend.name)}
                          className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                            invited.includes(friend.name)
                              ? 'bg-gray-100 text-gray-500'
                              : 'bg-emerald-600 text-white hover:bg-emerald-700'
                          }`}
                        >
                          {invited.includes(friend.name) ? 'Gönderildi' : 'Meydan Oku'}
                        </button>
                      ) : (
                        <span className="text-gray-400 font-normal">Siz</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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
