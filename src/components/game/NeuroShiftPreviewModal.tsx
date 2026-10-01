'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, ShieldAlert, Target, Play, Brain, CheckCircle, ArrowRight } from 'lucide-react';

interface NeuroShiftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGamePhase2?: () => void;
}

export const NeuroShiftPreviewModal: React.FC<NeuroShiftPreviewModalProps> = ({
  isOpen,
  onClose,
  onStartGamePhase2,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-slate-900 border border-sky-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden"
        >
          {/* Neon Glow Corner */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-sky-500/20 to-purple-500/20 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-purple-600 p-[1.5px]">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-sky-400">
                <Brain className="w-6 h-6 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Aşama 2 İlk Oyunu
                </span>
                <span className="text-xs text-slate-400">Bilişsel Alan: Esneklik & Dikkat</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                NeuroShift: Çapraz Kural & Distractor Simülatörü
              </h2>
            </div>
          </div>

          {/* Anti-Plateau Core Concept */}
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed mb-6">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-sky-400" />
                Lumosity Eksiğini Çözen Anti-Plato Mekaniği:
              </h4>
              <p className="text-xs text-slate-300">
                Geleneksel beyin oyunlarında oyuncu 20 saniye sonra "kas hafızasına" geçer; beyni otomatik pilota bağlar ve bilişsel gelişim durur. 
                <strong className="text-white"> NeuroShift’te ise kurallar her 3-5 doğru hamlede bir habersizce tersine döner</strong> ve ekranda mikro çeldiriciler (flanker distractor) belirir. Beyin asla ezbere dayalı ritme giremez.
              </p>
            </div>

            {/* Rule Dynamics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="font-bold text-white block mb-1">Kural 1: Şekil mi, Renk mi?</span>
                <p className="text-slate-400">
                  Merkezdeki kart mavi-çerçeveli ise <em>RENK</em>, altın-çerçeveli ise <em>ŞEKİL</em> eşleşmesi yapılmalıdır. Çerçeve renkleri habersiz yer değiştirir.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <span className="font-bold text-white block mb-1">Kural 2: Stroop Çeldiricileri</span>
                <p className="text-slate-400">
                  Kartın üzerinde "KIRMIZI" yazarken rengi mavi olabilir. Beyin kelimeyi okumakla rengi algılamak arasında inhibisyon mücadelesi verir.
                </p>
              </div>
            </div>

            {/* Far Transfer Reality Check */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-emerald-200">Pratik Hayat Yansıması (Far Transfer): </strong>
                İş toplantısında aniden değişen gündem maddelerine şaşırmadan hızlı uyum sağlama ve kalabalık ofiste çalışırken gelen bildirimleri zihinsel olarak anında filtreleme.
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Aşama 1 tamamlandıktan sonra Aşama 2’de doğrudan oynanabilir motor bağlanacak.
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-sky-500/25 transition-all"
            >
              Panoya Dön ve İncele
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
