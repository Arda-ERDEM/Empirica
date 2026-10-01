'use client';

import React, { useState } from 'react';
import { Bell, Clock, Calendar, Volume2, CheckCircle2, X } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose }) => {
  const { notificationEnabled, notificationTime, setNotificationSettings } = useGameStore();

  const [enabled, setEnabled] = useState(notificationEnabled);
  const [time, setTime] = useState(notificationTime);
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'custom'>('daily');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [savedBanner, setSavedBanner] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setNotificationSettings(enabled, time);
    setSavedBanner(true);
    setTimeout(() => {
      setSavedBanner(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm font-sans text-gray-900">
      <div className="relative max-w-md w-full bg-white border border-gray-300 rounded-xl shadow-2xl overflow-hidden space-y-4">
        {/* Classic Blazor Header */}
        <div className="bg-[#1b2a47] text-white px-4 py-3 flex items-center justify-between border-b border-gray-400">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-300" />
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Hatırlatıcı & Bildirim Servisi</h3>
              <p className="text-[11px] text-slate-300">Günlük Egzersiz Zaman Planı</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 pt-1 space-y-4 text-xs">
          {/* Saved Banner */}
          {savedBanner && (
            <div className="p-2.5 rounded bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Ayarlar kaydedildi!</span>
            </div>
          )}

          {/* Toggle Notification */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="font-bold text-gray-900 block">Günlük Hatırlatıcılar</span>
              <span className="text-[11px] text-gray-500">Belirlenen saatte antrenman alarmı gönder</span>
            </div>
            <button
              onClick={() => setEnabled(!enabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                enabled ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform shadow-sm absolute top-0.5 ${
                  enabled ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Time Picker */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1.5">
            <label className="font-bold text-gray-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Hatırlatma Saati</span>
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!enabled}
              className="w-full bg-white border border-gray-300 rounded px-3 py-1.5 text-xs text-gray-800 disabled:opacity-50"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs border border-gray-300 transition-colors"
            >
              Vazgeç
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 rounded bg-[#0d6efd] hover:bg-[#0b5ed7] text-white font-bold text-xs shadow-sm transition-colors"
            >
              Değişiklikleri Kaydet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
