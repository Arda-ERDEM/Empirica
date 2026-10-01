'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { sounds } from '@/utils/soundEffects';
import confetti from 'canvas-confetti';
import {
  X,
  RotateCcw,
  Grid,
  Trophy,
  Coins,
  Star,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Eye,
  Crown,
} from 'lucide-react';

interface ChessGameProps {
  onClose: () => void;
  onOpenLevelSelect?: () => void;
}

type Piece = string | null; // e.g. 'wK', 'wQ', 'wR', 'wB', 'wN', 'wP', 'bK', 'bQ', 'bR', 'bB', 'bN', 'bP'

interface Puzzle {
  level: number;
  title: string;
  theme: string;
  hint: string;
  turn: 'w' | 'b';
  // 8x8 board: [rank 8 down to rank 1, file a to h]
  initialBoard: Piece[][];
  // Valid solution: [fromRow, fromCol, toRow, toCol]
  solution: [number, number, number, number];
  followUpMove?: {
    opponentMove: [number, number, number, number];
    playerReply: [number, number, number, number];
  };
}

const PIECE_SYMBOLS: Record<string, string> = {
  wK: '♔',
  wQ: '♕',
  wR: '♖',
  wB: '♗',
  wN: '♘',
  wP: '♙',
  bK: '♚',
  bQ: '♛',
  bR: '♜',
  bB: '♝',
  bN: '♞',
  bP: '♟',
};

// Generate 20 distinct tactical chess puzzles
const CHESS_PUZZLES: Puzzle[] = [
  {
    "level": 1,
    "title": "Çoban Matı (Scholar's Mate)",
    "theme": "f7 Zayıflığı & Vezir Saldırısı",
    "hint": "Vezirinizi f3'ten f7 karesine sürerek şah mat yapın.",
    turn: 'w' as const,
    "initialBoard": [
      [
        "bR",
        "bN",
        "bB",
        "bQ",
        "bK",
        "bB",
        "bN",
        "bR"
      ],
      [
        "bP",
        "bP",
        "bP",
        "bP",
        null,
        "bP",
        "bP",
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        "bP",
        null,
        null,
        null
      ],
      [
        null,
        null,
        "wB",
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        "wQ",
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        "wP",
        "wP",
        "wP",
        "wP",
        "wP"
      ],
      [
        "wR",
        "wN",
        "wB",
        null,
        "wK",
        null,
        "wN",
        "wR"
      ]
    ],
    solution: [5, 5, 1, 5] as [number, number, number, number]
  },
  {
    "level": 2,
    "title": "Arka Sıra Koridor Matı (Back-Rank Mate)",
    "theme": "Hava Deliği Olmayan Şah",
    "hint": "Kaleyi 8. yataya (d8) indirerek arka sıradan şah mat yapın.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        "bK",
        null,
        null,
        null
      ],
      [
        "bP",
        "bP",
        "bP",
        null,
        null,
        "bP",
        "bP",
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        "wR",
        "wK",
        null,
        null,
        null
      ]
    ],
    solution: [7, 3, 0, 3] as [number, number, number, number]
  },
  {
    "level": 3,
    "title": "Arap Matı (Arabian Mate)",
    "theme": "Kale & At İşbirliği",
    "hint": "Kaleyi h7 karesine oynayın. At g6 kaçış karesini ve kaleyi korur.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "bK"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        "bP",
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        "wN",
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "wR"
      ],
      [
        "wP",
        "wP",
        null,
        null,
        null,
        null,
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        null,
        null,
        null
      ]
    ],
    solution: [5, 7, 1, 7] as [number, number, number, number]
  },
  {
    "level": 4,
    "title": "Boğmaca Matı (Smothered Mate)",
    "theme": "Kendi Taşları Arasında Sıkışan Şah",
    "hint": "Atı f7 karesine oynayarak siyah şahı kendi taşları arasında mat edin.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        null,
        "bR",
        "bK",
        null
      ],
      [
        "bP",
        "bP",
        null,
        null,
        null,
        "bP",
        "bP",
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        "wN",
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        null,
        null,
        null
      ]
    ],
    solution: [3, 4, 1, 5] as [number, number, number, number]
  },
  {
    "level": 5,
    "title": "Kraliyet Çatalı (Royal Knight Fork)",
    "theme": "Şah ve Kaleye Aynı Anda Saldırı",
    "hint": "Atı c7 karesine zıplatıp şah çekerek kaleyi kazanın.",
    turn: 'w' as const,
    "initialBoard": [
      [
        "bR",
        null,
        null,
        null,
        "bK",
        null,
        null,
        null
      ],
      [
        "bP",
        "bP",
        null,
        null,
        null,
        "bP",
        "bP",
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        "wN",
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        null,
        null,
        null
      ]
    ],
    solution: [3, 3, 1, 2] as [number, number, number, number]
  },
  {
    "level": 6,
    "title": "Vezir Çatalı (Double Attack)",
    "theme": "Şah ve Savunmasız Kaleyi Yakalama",
    "hint": "Vezirle e4 karesinden şah çekip boşta kalan a8 kalesine saldırın.",
    turn: 'w' as const,
    "initialBoard": [
      [
        "bR",
        null,
        null,
        null,
        "bK",
        null,
        null,
        null
      ],
      [
        "bP",
        "bP",
        null,
        null,
        null,
        "bP",
        "bP",
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wQ",
        "wK",
        null,
        null
      ]
    ],
    solution: [7, 4, 4, 4] as [number, number, number, number]
  },
  {
    "level": 7,
    "title": "Mutlak Açmaz (Absolute Pin)",
    "theme": "Açmazdaki Veziri Kazanma",
    "hint": "Fili b5 karesine gelip siyah veziri şahın önünde çivileyin.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        "bK",
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        "bQ",
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        "wB",
        null,
        null
      ]
    ],
    solution: [7, 5, 3, 1] as [number, number, number, number]
  },
  {
    "level": 8,
    "title": "Şiş Hamlesi (The Skewer)",
    "theme": "Öndeki Şahı Kaçırıp Arkadaki Veziri Düşürme",
    "hint": "Kaleyi e1 karesine getirerek aynı dikeydeki şahı ve veziri şişe dizin.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        "bQ",
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        "bK",
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        null,
        null,
        null,
        null,
        "wP",
        "wP"
      ],
      [
        "wR",
        null,
        null,
        null,
        null,
        null,
        "wK",
        null
      ]
    ],
    solution: [7, 0, 7, 4] as [number, number, number, number]
  },
  {
    "level": 9,
    "title": "Saptırma Taktigi (Deflection)",
    "theme": "Savunmacıyı Görevinden Uzaklaştırma",
    "hint": "Vezirinizi f8 karesine feda ederek siyah kaleyi 8. yataydan saptırın.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        null,
        "bR",
        "bK",
        null
      ],
      [
        "bP",
        "bP",
        "bP",
        null,
        null,
        null,
        "bP",
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        "wQ",
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        "wR",
        "wK",
        null,
        null,
        null
      ]
    ],
    solution: [5, 5, 0, 5] as [number, number, number, number]
  },
  {
    "level": 10,
    "title": "Açarak Şah (Discovered Check)",
    "theme": "Öndeki Taşı Çekip Kalenin Yolunu Açma",
    "hint": "Atı d7 karesine zıplatıp açarak şah çekin ve vezir tehdidi yaratın.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        "bK",
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "bQ",
        null,
        null,
        null,
        "wN",
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wR",
        "wK",
        null,
        null
      ]
    ],
    solution: [3, 4, 1, 3] as [number, number, number, number]
  },
  {
    "level": 11,
    "title": "Anastasya Matı (Anastasia's Mate)",
    "theme": "Kale & At İşbirliğiyle Kenar Matı",
    "hint": "Kaleyi h5 karesine getirerek kenardaki şahı mat edin.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "bK"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        "bP",
        null
      ],
      [
        "wR",
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        "wN",
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        null,
        null,
        null
      ]
    ],
    solution: [3, 0, 3, 7] as [number, number, number, number]
  },
  {
    "level": 12,
    "title": "Boden Matı (Boden's Mate)",
    "theme": "Çapraz Çift Fil Matı",
    "hint": "Fili a6 karesine getirerek c8'deki şahı çaprazdan mat edin.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        "bK",
        "bR",
        null,
        null,
        null,
        null
      ],
      [
        null,
        "bP",
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "wB"
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        "wB",
        null,
        null
      ]
    ],
    solution: [7, 5, 2, 0] as [number, number, number, number]
  },
  {
    "level": 13,
    "title": "Kırlangıç Kuyruğu (Swallow's Tail Mate)",
    "theme": "Vezirin Arkasında Kalan İki Kale",
    "hint": "Veziri e6 karesine indirip piyon desteğiyle şah mat yapın.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        "bR",
        null,
        "bR",
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        "bK",
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        "wP",
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        "wQ",
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        null,
        null,
        null
      ]
    ],
    solution: [4, 4, 2, 4] as [number, number, number, number]
  },
  {
    "level": 14,
    "title": "Kanca Matı (Hook Mate)",
    "theme": "Kale, At ve Piyon Kilidi",
    "hint": "Kaleyi h8 karesine oynayarak at desteğiyle mat edin.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "bK"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        "bP",
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        "wN",
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        "wP",
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        null,
        null,
        "wR"
      ]
    ],
    solution: [7, 7, 0, 7] as [number, number, number, number]
  },
  {
    "level": 15,
    "title": "Greco Matı (Greco's Mate)",
    "theme": "Açık h-Dikeyinde Vezir Matı",
    "hint": "Veziri h7 karesine oynayarak fil korumasında şah mat yapın.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "bK"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        "bP",
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        "wB",
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        "wQ"
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        null
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        null,
        null,
        null
      ]
    ],
    solution: [5, 7, 1, 7] as [number, number, number, number]
  },
  {
    "level": 16,
    "title": "Piyon Terfisiyle Mat (Pawn Promotion)",
    "theme": "Son Yataya Ulaşan Piyon",
    "hint": "Piyonu d8 karesine sürerek vezire terfi edin ve şah mat yapın.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        "bK",
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        "wP",
        null,
        "bP",
        "bP",
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        null,
        null,
        null
      ]
    ],
    solution: [1, 3, 0, 3] as [number, number, number, number]
  },
  {
    "level": 17,
    "title": "Blackburne Matı (Blackburne's Mate)",
    "theme": "İki Fil ve At Hücumu",
    "hint": "Fili g7 karesine oynayarak şahı köşede mat edin.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        null,
        "bR",
        null,
        "bK"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        "bP",
        null,
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        "wN",
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        "wB",
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wB",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        null,
        null,
        null
      ]
    ],
    solution: [6, 1, 1, 6] as [number, number, number, number]
  },
  {
    "level": 18,
    "title": "Vezir Fedası (Queen Sacrifice)",
    "theme": "Kalenin Yolunu Açma",
    "hint": "Veziri g8 karesine feda ederek şah mat kombinezonunu başlatın.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        null,
        null,
        "bK",
        null
      ],
      [
        "bP",
        "bP",
        "bP",
        null,
        null,
        "bP",
        null,
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        "wQ",
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wK",
        null,
        null,
        "wR"
      ]
    ],
    solution: [5, 6, 0, 6] as [number, number, number, number]
  },
  {
    "level": 19,
    "title": "Çifte Şah (Double Check)",
    "theme": "Şah Kaçmak Zorunda",
    "hint": "Atı e7 karesine oynayarak hem atla hem kaleyle çifte şah çekin.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        null,
        null,
        "bK",
        null
      ],
      [
        "bP",
        "bP",
        "bP",
        null,
        null,
        "bP",
        "bP",
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        "wN",
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        null,
        "wR",
        "wK",
        null,
        null
      ]
    ],
    solution: [3, 3, 1, 4] as [number, number, number, number]
  },
  {
    "level": 20,
    "title": "Morphy Opera Matı (Morphy's Mate)",
    "theme": "Büyükusta Kombinezonu",
    "hint": "Kaleyi d8 karesine indirip fil desteğiyle büyükusta matı yapın.",
    turn: 'w' as const,
    "initialBoard": [
      [
        null,
        null,
        null,
        null,
        "bK",
        null,
        null,
        null
      ],
      [
        "bP",
        "bP",
        "bP",
        null,
        null,
        "bP",
        "bP",
        "bP"
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        "wB",
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
      ],
      [
        "wP",
        "wP",
        "wP",
        null,
        null,
        "wP",
        "wP",
        "wP"
      ],
      [
        null,
        null,
        null,
        "wR",
        "wK",
        null,
        null,
        null
      ]
    ],
    solution: [7, 3, 0, 3] as [number, number, number, number]
  }
];

export const ChessGame: React.FC<ChessGameProps> = ({
  onClose,
  onOpenLevelSelect,
}) => {
  const { getSelectedLevel, selectGameLevel, completeGameLevel } = useGameStore();
  const currentLvl = getSelectedLevel('chess');

  const puzzleIdx = Math.min(CHESS_PUZZLES.length - 1, Math.max(0, currentLvl - 1));
  const puzzle = CHESS_PUZZLES[puzzleIdx];

  const [board, setBoard] = useState<Piece[][]>(puzzle.initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [gameState, setGameState] = useState<'playing' | 'level_won' | 'wrong_move'>('playing');
  const [showHint, setShowHint] = useState(false);
  const [mode, setMode] = useState<'puzzle' | 'free'>('puzzle');

  // Reset board on level change
  useEffect(() => {
    setBoard(puzzle.initialBoard);
    setSelectedSquare(null);
    setGameState('playing');
    setShowHint(false);
  }, [puzzle]);

  // Handle square clicks
  const handleSquareClick = (r: number, c: number) => {
    if (gameState === 'level_won') return;

    if (!selectedSquare) {
      const piece = board[r][c];
      // Select only white pieces if white's turn
      if (piece && piece.startsWith(puzzle.turn)) {
        sounds.playClick();
        setSelectedSquare([r, c]);
      }
      return;
    }

    const [fromR, fromC] = selectedSquare;

    // Deselect if clicked same square
    if (fromR === r && fromC === c) {
      setSelectedSquare(null);
      return;
    }

    // Switch selection to another own piece
    const destPiece = board[r][c];
    if (destPiece && destPiece.startsWith(puzzle.turn)) {
      sounds.playClick();
      setSelectedSquare([r, c]);
      return;
    }

    // Attempt Move
    sounds.playClick();

    if (mode === 'free') {
      // Free play mode: allow move anywhere
      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = newBoard[fromR][fromC];
      newBoard[fromR][fromC] = null;
      setBoard(newBoard);
      setSelectedSquare(null);
      return;
    }

    // Puzzle mode check
    const [solFromR, solFromC, solToR, solToC] = puzzle.solution;
    if (fromR === solFromR && fromC === solFromC && r === solToR && c === solToC) {
      // Correct Move!
      const newBoard = board.map((row) => [...row]);
      newBoard[r][c] = newBoard[fromR][fromC];
      newBoard[fromR][fromC] = null;
      setBoard(newBoard);
      setSelectedSquare(null);
      handleWin();
    } else {
      // Wrong move
      sounds.playError();
      setGameState('wrong_move');
      setSelectedSquare(null);
    }
  };

  const handleWin = () => {
    sounds.playLevelComplete();
    setGameState('level_won');

    const stars = showHint ? 2 : 3;
    const score = 300 + currentLvl * 50;
    const coins = 30;

    completeGameLevel('chess', currentLvl, stars, score, coins);

    try {
      confetti({ particleCount: 80, spread: 75, origin: { y: 0.6 } });
    } catch {}
  };

  const restartLevel = () => {
    setBoard(puzzle.initialBoard);
    setSelectedSquare(null);
    setGameState('playing');
    setShowHint(false);
  };

  const nextLevel = () => {
    if (currentLvl < 20) {
      selectGameLevel('chess', currentLvl + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-white border border-gray-300 rounded-xl shadow-2xl flex flex-col max-h-[95vh] overflow-y-auto text-gray-900 font-sans">
        {/* Classic Blazor / Windows Window Title Bar */}
        <div className="bg-[#1b2a47] text-white px-4 py-2.5 rounded-t-xl flex items-center justify-between border-b border-gray-400">
          <div className="flex items-center gap-2">
            <span className="text-lg">♟️</span>
            <span className="font-bold text-sm tracking-wide">
              Empirica Chess: Taktik & Bilişsel Strateji (Seviye {currentLvl} / 20)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenLevelSelect && (
              <button
                onClick={onOpenLevelSelect}
                className="px-2 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1"
                title="Seviyeler"
              >
                <Grid className="w-3.5 h-3.5" />
                <span>Seviye Listesi</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-red-600 rounded text-slate-200 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar & Mode Select */}
        <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-700 uppercase">Tema:</span>
            <span className="px-2 py-0.5 bg-blue-100 border border-blue-300 text-blue-800 rounded font-semibold">
              {puzzle.theme}
            </span>
            <span className="font-medium text-gray-600">
              Sıra: <b className="text-gray-900">Beyaz Oynar ve Kazanır</b>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded font-medium flex items-center gap-1 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>İpucu {showHint ? 'Kapat' : 'Göster'}</span>
            </button>

            <button
              onClick={() => setMode(mode === 'puzzle' ? 'free' : 'puzzle')}
              className={`px-2.5 py-1 rounded font-medium border transition-colors ${
                mode === 'free'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {mode === 'free' ? 'Serbest Mod (Açık)' : 'Serbest Tahta'}
            </button>

            <button
              onClick={restartLevel}
              className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded font-medium flex items-center gap-1 transition-colors"
              title="Konumu Başa Sar"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Puzzle Goal & Hint banner */}
        <div className="px-4 py-2 bg-slate-50 border-b border-gray-200 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-gray-800 block text-sm">{puzzle.title}</span>
              <p className="text-gray-600 mt-0.5">
                Beyaz taşlarla en doğru taktik hamleyi yapın ve avantajı yakalayın.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-300 rounded">
                +30 Altın 🪙
              </span>
            </div>
          </div>

          {showHint && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-xs font-medium"
            >
              💡 <b>İpucu:</b> {puzzle.hint}
            </motion.div>
          )}
        </div>

        {/* 8x8 Chessboard Container */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-200">
          <div className="relative border-4 border-[#4a2e18] rounded shadow-xl bg-[#deb887]">
            {/* 8x8 Grid */}
            <div className="grid grid-cols-8 grid-rows-8 w-80 h-80 sm:w-96 sm:h-96">
              {board.map((row, r) =>
                row.map((piece, c) => {
                  const isLight = (r + c) % 2 === 0;
                  const isSelected = selectedSquare && selectedSquare[0] === r && selectedSquare[1] === c;
                  const isDestinationOption =
                    selectedSquare &&
                    selectedSquare[0] === puzzle.solution[0] &&
                    selectedSquare[1] === puzzle.solution[1] &&
                    r === puzzle.solution[2] &&
                    c === puzzle.solution[3];

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleSquareClick(r, c)}
                      className={`relative flex items-center justify-center transition-all select-none font-serif text-3xl sm:text-4xl ${
                        isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'
                      } ${isSelected ? 'ring-4 ring-yellow-400 z-10' : ''}`}
                    >
                      {/* Rank & File labels on border edges */}
                      {c === 0 && (
                        <span className="absolute top-0.5 left-1 text-[9px] font-sans font-bold text-gray-700 pointer-events-none">
                          {8 - r}
                        </span>
                      )}
                      {r === 7 && (
                        <span className="absolute bottom-0.5 right-1 text-[9px] font-sans font-bold text-gray-700 pointer-events-none">
                          {String.fromCharCode(97 + c)}
                        </span>
                      )}

                      {/* Destination dot indicator if hint or selected */}
                      {showHint && isDestinationOption && (
                        <div className="absolute w-3.5 h-3.5 rounded-full bg-emerald-600/80 animate-ping pointer-events-none" />
                      )}

                      {/* Chess Piece Symbol */}
                      {piece && (
                        <span
                          className={`drop-shadow ${
                            piece.startsWith('w')
                              ? 'text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]'
                              : 'text-black drop-shadow-[0_1px_2px_rgba(255,255,255,0.4)]'
                          }`}
                        >
                          {PIECE_SYMBOLS[piece] || piece}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Feedback / Bottom Bar */}
        <div className="bg-gray-100 border-t border-gray-300 p-3 px-4 flex items-center justify-between text-xs text-gray-600">
          <span>
            Hamle yapmak için taştan hedef kareye tıklayın. Doğru hamle anında onaylanır.
          </span>
          <span className="font-semibold text-gray-800">
            FIDE / Uluslararası Satranç Kuralları
          </span>
        </div>

        {/* Win Modal Overlay */}
        <AnimatePresence>
          {gameState === 'level_won' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 z-20 text-white"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xl">
                <Crown className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-2xl font-bold">Harika Hamle! Şah Mat / Kazanç</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-sm">
                  {puzzle.title} taktiğini başarıyla çözdünüz. Zihinsel hesaplama ve pozisyonel kavrayışınız gelişti.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {[1, 2, 3].map((star) => (
                  <Star
                    key={star}
                    className={`w-7 h-7 ${
                      star <= (showHint ? 2 : 3)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 px-5 py-2 rounded text-xs font-bold">
                <span className="text-amber-400">+30 🪙 Altın Kazanıldı</span>
                <span className="text-slate-500">|</span>
                <span className="text-emerald-400">+350 Bilişsel Puan</span>
              </div>

              <div className="flex items-center gap-3 pt-2 w-full max-w-xs">
                <button
                  onClick={restartLevel}
                  className="px-4 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs border border-slate-600"
                >
                  Tekrar İncele
                </button>
                <button
                  onClick={nextLevel}
                  className="flex-1 py-2.5 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow"
                >
                  <span>Sonraki Bulmaca</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Wrong Move Alert */}
          {gameState === 'wrong_move' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-2.5 rounded-lg shadow-xl text-xs font-bold flex items-center gap-2 z-20"
            >
              <AlertCircle className="w-4 h-4" />
              <span>Yanlış hamle! Rakip savunma yapabilir. Tekrar deneyin.</span>
              <button
                onClick={() => setGameState('playing')}
                className="underline ml-2 text-white hover:text-red-200"
              >
                Geri Al
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
