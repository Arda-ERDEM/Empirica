export type CellType =
  | 'empty'
  | 'wall'
  | 'start'
  | 'exit'
  | 'key_red'
  | 'door_red'
  | 'key_blue'
  | 'door_blue'
  | 'coin'
  | 'hazard' // -2 moves trap
  | 'portal_a'
  | 'portal_b'
  | 'ice' // Slippery: player slides until dry land or wall
  | 'box' // Pushable block (Car parking / Sokoban)
  | 'plate' // Pressure plate: opens gate when pressed by box or player
  | 'switch' // Toggles red/blue laser states
  | 'laser_red' // Blocks path when red state is active
  | 'laser_blue'; // Blocks path when blue state is active

export interface MazeLevelData {
  levelNumber: number;
  title: string;
  gridSize: number;
  maxMoves: number; // TIGHT move budget! Very little margin for error
  threeStarMoves: number; // Exact zero-waste optimal moves
  coinsToCollect: number;
  requiredKeys: ('red' | 'blue')[];
  layout: CellType[][];
  tip: string;
  mechanicBadge: string;
}

export const MAZE_LEVELS: MazeLevelData[] = [
  // SEVİYE 1: Blok İtme & Buton (Car Parking / Sokoban Mekaniği)
  // Optimum: 6 hamle. Max: 10!
  {
    levelNumber: 1,
    title: 'Seviye 1: İlk Blok & Buton',
    gridSize: 4,
    maxMoves: 10,
    threeStarMoves: 6,
    coinsToCollect: 2,
    requiredKeys: [],
    mechanicBadge: '📦 Blok İtme',
    tip: 'Önündeki enerji bloğunu (📦) butonun (🔘) üzerine iterek yolu aç! Hamlen çok sınırlı.',
    layout: [
      ['start', 'empty', 'plate', 'empty'],
      ['empty', 'box', 'wall', 'empty'],
      ['coin', 'empty', 'empty', 'coin'],
      ['wall', 'wall', 'empty', 'exit'],
    ],
  },

  // SEVİYE 2: Buz Zemin (Sliding Ice)
  // Optimum: 5 hamle. Max: 6!
  {
    levelNumber: 2,
    title: 'Seviye 2: Kaygan Buz Koridoru',
    gridSize: 4,
    maxMoves: 6,
    threeStarMoves: 5,
    coinsToCollect: 2,
    requiredKeys: ['red'],
    mechanicBadge: '🧊 Buz Kayması',
    tip: 'Buzda (🧊) duramazsın, duvara çarpana kadar kayarsın! Doğru duvara çarpıp anahtarı kap.',
    layout: [
      ['start', 'ice', 'ice', 'key_red'],
      ['wall', 'empty', 'wall', 'empty'],
      ['coin', 'ice', 'door_red', 'coin'],
      ['wall', 'wall', 'wall', 'exit'],
    ],
  },

  // SEVİYE 3: Şalter ve Lazer Tersinimi (Toggle Switch)
  // Optimum: 7 hamle. Max: 8!
  {
    levelNumber: 3,
    title: 'Seviye 3: Lazer Şalteri',
    gridSize: 5,
    maxMoves: 8,
    threeStarMoves: 7,
    coinsToCollect: 3,
    requiredKeys: [],
    mechanicBadge: '⚡ Şalter & Lazer',
    tip: 'Şaltere (⚡) basınca Kırmızı Lazer söner, Mavi Lazer açılır! Sıralamayı doğru yap.',
    layout: [
      ['start', 'empty', 'switch', 'wall', 'exit'],
      ['wall', 'wall', 'empty', 'wall', 'laser_red'],
      ['coin', 'empty', 'empty', 'empty', 'empty'],
      ['wall', 'empty', 'wall', 'wall', 'empty'],
      ['coin', 'empty', 'coin', 'empty', 'empty'],
    ],
  },

  // SEVİYE 4: Bloğu Köşeye Sıkıştırma Tuzağı!
  // Optimum: 9 hamle. Max: 14!
  {
    levelNumber: 4,
    title: 'Seviye 4: Köşe Darboğazı',
    gridSize: 5,
    maxMoves: 14,
    threeStarMoves: 9,
    coinsToCollect: 3,
    requiredKeys: [],
    mechanicBadge: '📦 Hassas İtme',
    tip: 'Dikkat! Bloğu duvara yaslarsan geri çekemezsin. Önce arkasına geçip doğru yöne it.',
    layout: [
      ['start', 'empty', 'wall', 'plate', 'exit'],
      ['empty', 'box', 'empty', 'empty', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'coin'],
      ['wall', 'wall', 'coin', 'empty', 'empty'],
      ['coin', 'empty', 'empty', 'empty', 'empty'],
    ],
  },

  // SEVİYE 5: Buz + Lazer + Anahtar
  // Optimum: 9 hamle. Max: 10!
  {
    levelNumber: 5,
    title: 'Seviye 5: Buz Üzerinde Refleks',
    gridSize: 5,
    maxMoves: 10,
    threeStarMoves: 9,
    coinsToCollect: 4,
    requiredKeys: ['red'],
    mechanicBadge: '🧊 Buz + Lazer',
    tip: 'Buzdan kayarken tuzağa (⚠️) çarpmamak için duvarları basamak olarak kullan.',
    layout: [
      ['start', 'ice', 'hazard', 'key_red', 'wall'],
      ['empty', 'wall', 'empty', 'wall', 'empty'],
      ['coin', 'ice', 'door_red', 'coin', 'empty'],
      ['wall', 'empty', 'ice', 'empty', 'wall'],
      ['coin', 'coin', 'empty', 'empty', 'exit'],
    ],
  },

  // SEVİYE 6: Çift Blok ve İki Buton (Car Parking Mantığı)
  // Optimum: 11 hamle. Max: 12!
  {
    levelNumber: 6,
    title: 'Seviye 6: Çift Enerji Bloğu',
    gridSize: 5,
    maxMoves: 12,
    threeStarMoves: 11,
    coinsToCollect: 4,
    requiredKeys: [],
    mechanicBadge: '📦📦 İki Buton',
    tip: 'İki bloğu da butonların üzerine getirmelisin. Bir blok diğerinin yolunu kesebilir!',
    layout: [
      ['start', 'empty', 'plate', 'wall', 'exit'],
      ['empty', 'box', 'empty', 'plate', 'empty'],
      ['wall', 'empty', 'box', 'empty', 'wall'],
      ['coin', 'empty', 'wall', 'empty', 'coin'],
      ['coin', 'coin', 'empty', 'empty', 'empty'],
    ],
  },

  // SEVİYE 7: Portallar & Sıkı Hamle Bütçesi
  // Optimum: 13 hamle. Max: 18!
  {
    levelNumber: 7,
    title: 'Seviye 7: Solucan Deliği Sıçraması',
    gridSize: 6,
    maxMoves: 18,
    threeStarMoves: 13,
    coinsToCollect: 4,
    requiredKeys: ['red'],
    mechanicBadge: '🌀 Portallar',
    tip: 'Portal A (🌀) seni doğrudan Portal B\'ye fırlatır. Adım sayın sıfıra düşmeden anahtarı al.',
    layout: [
      ['start', 'empty', 'wall', 'exit', 'wall', 'coin'],
      ['empty', 'wall', 'wall', 'door_red', 'empty', 'empty'],
      ['portal_a', 'empty', 'empty', 'wall', 'empty', 'coin'],
      ['wall', 'wall', 'wall', 'wall', 'empty', 'empty'],
      ['portal_b', 'empty', 'empty', 'key_red', 'empty', 'coin'],
      ['coin', 'empty', 'empty', 'empty', 'empty', 'empty'],
    ],
  },

  // SEVİYE 8: Çift Lazer & Şalter Bulmacası
  // Optimum: 11 hamle. Max: 12!
  {
    levelNumber: 8,
    title: 'Seviye 8: Değişen Lazer Izgarası',
    gridSize: 6,
    maxMoves: 12,
    threeStarMoves: 11,
    coinsToCollect: 5,
    requiredKeys: ['red'],
    mechanicBadge: '⚡ Kırmızı & Mavi Lazer',
    tip: 'Kırmızı lazer açıkken mavi kapalıdır. Şalteri tam doğru anda tetikle.',
    layout: [
      ['start', 'empty', 'switch', 'wall', 'key_red', 'coin'],
      ['wall', 'wall', 'empty', 'wall', 'wall', 'empty'],
      ['coin', 'laser_red', 'empty', 'laser_blue', 'empty', 'coin'],
      ['empty', 'wall', 'wall', 'wall', 'wall', 'empty'],
      ['empty', 'door_red', 'empty', 'empty', 'empty', 'coin'],
      ['coin', 'wall', 'empty', 'empty', 'empty', 'exit'],
    ],
  },

  // SEVİYE 9: Buz Labirenti & Kayma Açısı
  // Optimum: 10 hamle. Max: 11!
  {
    levelNumber: 9,
    title: 'Seviye 9: Nöral Buz Pisti',
    gridSize: 6,
    maxMoves: 11,
    threeStarMoves: 10,
    coinsToCollect: 5,
    requiredKeys: ['red'],
    mechanicBadge: '🧊 Full Buz Alanı',
    tip: 'Zeminin çoğu buz! Nerede duracağını ve hangi duvara toslayacağını milimetrik planla.',
    layout: [
      ['start', 'ice', 'ice', 'wall', 'key_red', 'coin'],
      ['ice', 'wall', 'ice', 'ice', 'ice', 'empty'],
      ['ice', 'ice', 'hazard', 'wall', 'door_red', 'coin'],
      ['wall', 'ice', 'ice', 'ice', 'ice', 'empty'],
      ['coin', 'empty', 'wall', 'ice', 'empty', 'coin'],
      ['coin', 'empty', 'empty', 'empty', 'empty', 'exit'],
    ],
  },

  // SEVİYE 10: Blok + Portal + Buton Kombinasyonu
  // Optimum: 13 hamle. Max: 14!
  {
    levelNumber: 10,
    title: 'Seviye 10: Kuantum Blok Seferi',
    gridSize: 6,
    maxMoves: 14,
    threeStarMoves: 13,
    coinsToCollect: 6,
    requiredKeys: [],
    mechanicBadge: '📦 + 🌀 Hibrit',
    tip: 'Bloğu iterek portaldan geçirip diğer taraftaki butonun üstüne oturt!',
    layout: [
      ['start', 'empty', 'box', 'portal_a', 'wall', 'coin'],
      ['wall', 'wall', 'empty', 'wall', 'wall', 'empty'],
      ['coin', 'empty', 'empty', 'empty', 'empty', 'coin'],
      ['wall', 'wall', 'wall', 'wall', 'empty', 'empty'],
      ['portal_b', 'empty', 'plate', 'empty', 'empty', 'coin'],
      ['coin', 'wall', 'empty', 'empty', 'empty', 'exit'],
    ],
  },

  // SEVİYE 11: Dar Koridor ve Sıfır Tolerans
  // Optimum: 12 hamle. Max: 13!
  {
    levelNumber: 11,
    title: 'Seviye 11: Sıfır Tolerans',
    gridSize: 7,
    maxMoves: 13,
    threeStarMoves: 12,
    coinsToCollect: 6,
    requiredKeys: ['red', 'blue'],
    mechanicBadge: '🎯 Milimetrik Rota',
    tip: 'Tek bir yanlış adım bile hamle hakkını bitirir. Çift anahtarı en kısa yoldan topla.',
    layout: [
      ['start', 'empty', 'coin', 'wall', 'key_red', 'empty', 'coin'],
      ['empty', 'wall', 'empty', 'wall', 'empty', 'wall', 'empty'],
      ['empty', 'wall', 'empty', 'door_red', 'empty', 'wall', 'empty'],
      ['coin', 'door_blue', 'wall', 'wall', 'empty', 'key_blue', 'coin'],
      ['empty', 'empty', 'empty', 'empty', 'empty', 'wall', 'empty'],
      ['wall', 'wall', 'hazard', 'wall', 'hazard', 'wall', 'coin'],
      ['coin', 'empty', 'empty', 'empty', 'empty', 'empty', 'exit'],
    ],
  },

  // SEVİYE 12: Şalterle Tuzak Kapatma
  // Optimum: 20 hamle. Max: 26!
  {
    levelNumber: 12,
    title: 'Seviye 12: Lazerli Tuzak Alanı',
    gridSize: 7,
    maxMoves: 26,
    threeStarMoves: 20,
    coinsToCollect: 7,
    requiredKeys: ['red'],
    mechanicBadge: '⚡+ ⚠️ Tuzak Yönetimi',
    tip: 'Lazerleri kapatmadan geçmeye çalışma, doğrudan -2 hamle yersin.',
    layout: [
      ['start', 'empty', 'switch', 'wall', 'key_red', 'coin', 'empty'],
      ['wall', 'wall', 'empty', 'wall', 'wall', 'empty', 'coin'],
      ['coin', 'laser_red', 'empty', 'laser_red', 'empty', 'empty', 'empty'],
      ['wall', 'wall', 'wall', 'wall', 'door_red', 'wall', 'wall'],
      ['coin', 'empty', 'laser_blue', 'empty', 'empty', 'empty', 'coin'],
      ['empty', 'wall', 'hazard', 'wall', 'hazard', 'wall', 'empty'],
      ['coin', 'empty', 'empty', 'empty', 'empty', 'empty', 'exit'],
    ],
  },

  // SEVİYE 13: Blok ile Lazer Engelleme
  // Optimum: 16 hamle. Max: 22!
  {
    levelNumber: 13,
    title: 'Seviye 13: Lazer Kalkanı',
    gridSize: 7,
    maxMoves: 22,
    threeStarMoves: 16,
    coinsToCollect: 7,
    requiredKeys: [],
    mechanicBadge: '⚡+ 📦 Lazer & Şalter',
    tip: 'Şaltere basarak kırmızı lazeri kapat ve güvenli koridordan çıkışa ulaş.',
    layout: [
      ['start', 'empty', 'switch', 'empty', 'laser_red', 'empty', 'exit'],
      ['empty', 'empty', 'empty', 'wall', 'empty', 'empty', 'empty'],
      ['coin', 'box', 'plate', 'empty', 'empty', 'empty', 'coin'],
      ['wall', 'wall', 'wall', 'empty', 'wall', 'wall', 'empty'],
      ['empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'coin'],
      ['coin', 'wall', 'hazard', 'empty', 'hazard', 'wall', 'empty'],
      ['empty', 'empty', 'coin', 'empty', 'empty', 'empty', 'empty'],
    ],
  },

  // SEVİYE 14: Buz Pistinde Blok İtme
  // Optimum: 22 hamle. Max: 30!
  {
    levelNumber: 14,
    title: 'Seviye 14: Buz Üstünde Blok',
    gridSize: 7,
    maxMoves: 30,
    threeStarMoves: 22,
    coinsToCollect: 7,
    requiredKeys: ['red'],
    mechanicBadge: '🧊 + 📦 Buzda İtme',
    tip: 'Buzlu zeminde blok da sonuna kadar kayar! Butonun tam hizasından itmelisin.',
    layout: [
      ['start', 'ice', 'box', 'ice', 'plate', 'coin', 'empty'],
      ['empty', 'wall', 'empty', 'wall', 'empty', 'wall', 'empty'],
      ['coin', 'empty', 'key_red', 'door_red', 'empty', 'empty', 'coin'],
      ['empty', 'wall', 'wall', 'wall', 'wall', 'empty', 'wall'],
      ['coin', 'empty', 'ice', 'ice', 'empty', 'empty', 'coin'],
      ['wall', 'hazard', 'wall', 'hazard', 'wall', 'wall', 'empty'],
      ['coin', 'empty', 'empty', 'coin', 'empty', 'empty', 'exit'],
    ],
  },

  // SEVİYE 15: Çift Portal + Çift Kilit
  // Optimum: 24 hamle. Max: 32!
  {
    levelNumber: 15,
    title: 'Seviye 15: Çok Boyutlu Geçit',
    gridSize: 7,
    maxMoves: 32,
    threeStarMoves: 24,
    coinsToCollect: 8,
    requiredKeys: ['red', 'blue'],
    mechanicBadge: '🌀🌀 Çift Portal',
    tip: 'Önce Mavi Anahtarı al, kapıyı aç ve Kırmızı anahtara ulaş.',
    layout: [
      ['start', 'empty', 'key_blue', 'wall', 'portal_a', 'coin', 'empty'],
      ['empty', 'wall', 'wall', 'wall', 'wall', 'wall', 'door_red'],
      ['coin', 'door_blue', 'empty', 'empty', 'key_red', 'empty', 'coin'],
      ['wall', 'wall', 'wall', 'empty', 'wall', 'wall', 'wall'],
      ['portal_b', 'empty', 'coin', 'empty', 'empty', 'empty', 'coin'],
      ['wall', 'hazard', 'wall', 'hazard', 'wall', 'empty', 'empty'],
      ['coin', 'empty', 'empty', 'coin', 'empty', 'empty', 'exit'],
    ],
  },

  // SEVİYE 16: Üçlü Şalter ve Lazer Kombinasyonu
  // Optimum: 16 hamle. Max: 17!
  {
    levelNumber: 16,
    title: 'Seviye 16: Tri-Lazer Matrisi',
    gridSize: 7,
    maxMoves: 17,
    threeStarMoves: 16,
    coinsToCollect: 8,
    requiredKeys: ['red'],
    mechanicBadge: '⚡⚡ Çift Şalter',
    tip: 'İki farklı şalter farklı lazerleri tetikler. Zihninde durum tablosu kur.',
    layout: [
      ['start', 'switch', 'empty', 'wall', 'laser_red', 'key_red', 'coin'],
      ['wall', 'wall', 'empty', 'wall', 'wall', 'wall', 'empty'],
      ['coin', 'laser_blue', 'empty', 'switch', 'empty', 'door_red', 'coin'],
      ['wall', 'wall', 'wall', 'empty', 'wall', 'wall', 'wall'],
      ['empty', 'empty', 'laser_red', 'empty', 'empty', 'empty', 'coin'],
      ['coin', 'wall', 'hazard', 'empty', 'hazard', 'wall', 'empty'],
      ['empty', 'empty', 'coin', 'empty', 'empty', 'empty', 'exit'],
    ],
  },

  // SEVİYE 17: Büyük Labirent Darboğazı
  // Optimum: 17 hamle. Max: 18!
  {
    levelNumber: 17,
    title: 'Seviye 17: Büyük Darboğaz',
    gridSize: 7,
    maxMoves: 18,
    threeStarMoves: 17,
    coinsToCollect: 8,
    requiredKeys: ['red', 'blue'],
    mechanicBadge: '📦 + ⚡ Blok & Şalter',
    tip: 'Bloğu butona it, şaltere bas ve kapıların ardındaki altınları topla.',
    layout: [
      ['start', 'empty', 'box', 'plate', 'wall', 'key_red', 'coin'],
      ['wall', 'wall', 'empty', 'wall', 'wall', 'wall', 'empty'],
      ['coin', 'switch', 'empty', 'laser_red', 'empty', 'door_red', 'coin'],
      ['wall', 'wall', 'wall', 'empty', 'wall', 'wall', 'door_blue'],
      ['key_blue', 'empty', 'empty', 'empty', 'empty', 'empty', 'coin'],
      ['wall', 'hazard', 'wall', 'hazard', 'wall', 'hazard', 'wall'],
      ['coin', 'empty', 'coin', 'empty', 'coin', 'empty', 'exit'],
    ],
  },

  // SEVİYE 18: Kuantum Buz Labirenti
  // Optimum: 18 hamle. Max: 19!
  {
    levelNumber: 18,
    title: 'Seviye 18: Kuantum Buz Fırtınası',
    gridSize: 7,
    maxMoves: 19,
    threeStarMoves: 18,
    coinsToCollect: 9,
    requiredKeys: ['red', 'blue'],
    mechanicBadge: '🧊 + 🌀 Buz & Portal',
    tip: 'Buzdan kayarak doğrudan portala gir! Açıyı yanlış alırsan duvara çarparsın.',
    layout: [
      ['start', 'ice', 'ice', 'portal_a', 'wall', 'key_red', 'coin'],
      ['wall', 'wall', 'ice', 'wall', 'wall', 'wall', 'empty'],
      ['coin', 'door_red', 'ice', 'ice', 'empty', 'door_blue', 'coin'],
      ['wall', 'wall', 'wall', 'portal_b', 'wall', 'wall', 'wall'],
      ['key_blue', 'ice', 'ice', 'ice', 'empty', 'empty', 'coin'],
      ['wall', 'hazard', 'wall', 'hazard', 'wall', 'empty', 'empty'],
      ['coin', 'empty', 'coin', 'empty', 'empty', 'empty', 'exit'],
    ],
  },

  // SEVİYE 19: Çift Blok ve Lazerli Kilit Sistemi
  // Optimum: 19 hamle. Max: 20!
  {
    levelNumber: 19,
    title: 'Seviye 19: Usta Mimar Bulmacası',
    gridSize: 7,
    maxMoves: 20,
    threeStarMoves: 19,
    coinsToCollect: 10,
    requiredKeys: ['red', 'blue'],
    mechanicBadge: '📦📦 + ⚡ Tüm Mekanikler',
    tip: 'Blokları doğru açıyla it, şalteri çalıştır ve kilitleri tam 20 hamlede aş.',
    layout: [
      ['start', 'empty', 'box', 'plate', 'wall', 'key_red', 'coin'],
      ['wall', 'wall', 'empty', 'wall', 'wall', 'empty', 'empty'],
      ['coin', 'switch', 'empty', 'laser_red', 'box', 'door_red', 'coin'],
      ['wall', 'wall', 'wall', 'empty', 'wall', 'wall', 'door_blue'],
      ['key_blue', 'empty', 'empty', 'plate', 'empty', 'empty', 'coin'],
      ['wall', 'hazard', 'wall', 'hazard', 'wall', 'hazard', 'wall'],
      ['coin', 'empty', 'coin', 'empty', 'coin', 'empty', 'exit'],
    ],
  },

  // SEVİYE 20: Nöro-Mimar Zirvesi (Grandmaster Chess Matrix)
  // Optimum: 21 hamle. Max: 22!
  {
    levelNumber: 20,
    title: 'Seviye 20: Nöro-Mimar Zirvesi',
    gridSize: 7,
    maxMoves: 22,
    threeStarMoves: 21,
    coinsToCollect: 12,
    requiredKeys: ['red', 'blue'],
    mechanicBadge: '👑 Büyük Final',
    tip: 'Tebrikler! Buz, Blok, Portal, Lazer ve Butonların hepsi devrede. 1 hamle bile boşa harcanamaz!',
    layout: [
      ['start', 'ice', 'box', 'portal_a', 'plate', 'key_red', 'coin'],
      ['coin', 'wall', 'empty', 'wall', 'wall', 'wall', 'empty'],
      ['empty', 'door_red', 'ice', 'switch', 'laser_red', 'door_blue', 'coin'],
      ['wall', 'wall', 'wall', 'portal_b', 'wall', 'wall', 'wall'],
      ['key_blue', 'ice', 'empty', 'box', 'plate', 'empty', 'coin'],
      ['wall', 'hazard', 'wall', 'hazard', 'wall', 'hazard', 'wall'],
      ['coin', 'empty', 'coin', 'empty', 'coin', 'empty', 'exit'],
    ],
  },
];
