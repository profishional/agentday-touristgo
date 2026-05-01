export type Landmark = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  lat: number;
  lng: number;
  points: number;
  rarity: "common" | "rare" | "legendary";
  viatorSuggestions: { title: string; price: string; url: string }[];
};

// Hand-picked Lisbon scenic spots. Coordinates are approximate.
export const LANDMARKS: Landmark[] = [
  {
    id: "beato-innovation-district",
    name: "Beato Innovation District",
    emoji: "🏭",
    description:
      "The Unicorn Factory's home: a former military bakery (Manutenção Militar) reborn as Lisbon's startup campus. Look for the distinctive red-brick industrial warehouses, tall white smokestacks, sawtooth-roofed factory halls, and the adjacent Convento do Beato bell tower.",
    lat: 38.737,
    lng: -9.1097,
    points: 120,
    rarity: "legendary",
    viatorSuggestions: [
      {
        title: "Lisbon Street Art & Eastside Tour (incl. Beato)",
        price: "€32",
        url: "https://www.viator.com/Lisbon-tours/Walking-Tours/d712-g3",
      },
      {
        title: "Marvila & Beato Craft Beer Crawl",
        price: "€45",
        url: "https://www.viator.com/Lisbon-tours/Food-Wine-and-Nightlife-Tours/d712-g6",
      },
    ],
  },
  {
    id: "belem-tower",
    name: "Belém Tower",
    emoji: "🗼",
    description: "16th-century Manueline fortification on the Tagus.",
    lat: 38.6916,
    lng: -9.2159,
    points: 100,
    rarity: "legendary",
    viatorSuggestions: [
      {
        title: "Lisbon: Belém District Walking Tour",
        price: "€28",
        url: "https://www.viator.com/Lisbon-tours/Walking-Tours/d712-g3",
      },
      {
        title: "Lisbon River Cruise: Belém by Sunset",
        price: "€42",
        url: "https://www.viator.com/Lisbon-tours/Cruises-Sailing-Water-Tours/d712-g16",
      },
    ],
  },
  {
    id: "jeronimos-monastery",
    name: "Jerónimos Monastery",
    emoji: "⛪",
    description: "UNESCO-listed Manueline masterpiece next to Belém.",
    lat: 38.6979,
    lng: -9.2068,
    points: 100,
    rarity: "legendary",
    viatorSuggestions: [
      {
        title: "Skip-the-Line: Jerónimos Monastery Tour",
        price: "€35",
        url: "https://www.viator.com/Lisbon-tours/Skip-the-Line-Tours/d712-g26-c151",
      },
    ],
  },
  {
    id: "miradouro-senhora-do-monte",
    name: "Miradouro da Senhora do Monte",
    emoji: "🌅",
    description: "The highest viewpoint in Lisbon. Sunset crowd.",
    lat: 38.7196,
    lng: -9.1322,
    points: 60,
    rarity: "rare",
    viatorSuggestions: [
      {
        title: "Lisbon Sunset Tuk-Tuk Tour of the Miradouros",
        price: "€39",
        url: "https://www.viator.com/Lisbon-tours/d712",
      },
    ],
  },
  {
    id: "praca-do-comercio",
    name: "Praça do Comércio",
    emoji: "🏛️",
    description: "The grand riverside square at the heart of the city.",
    lat: 38.7075,
    lng: -9.1364,
    points: 50,
    rarity: "common",
    viatorSuggestions: [
      {
        title: "Lisbon Old Town & Alfama Walking Tour",
        price: "€22",
        url: "https://www.viator.com/Lisbon-tours/Walking-Tours/d712-g3",
      },
    ],
  },
  {
    id: "santa-justa-lift",
    name: "Santa Justa Lift",
    emoji: "🛗",
    description: "Neo-Gothic iron elevator linking Baixa to Carmo.",
    lat: 38.7126,
    lng: -9.1393,
    points: 60,
    rarity: "rare",
    viatorSuggestions: [
      {
        title: "Lisbon Hop-On Hop-Off Bus + Santa Justa Pass",
        price: "€32",
        url: "https://www.viator.com/Lisbon-tours/Hop-on-Hop-off-Tours/d712-g26-c150",
      },
    ],
  },
  {
    id: "castelo-de-sao-jorge",
    name: "Castelo de São Jorge",
    emoji: "🏰",
    description: "Moorish castle crowning the Alfama hill.",
    lat: 38.7139,
    lng: -9.1334,
    points: 80,
    rarity: "rare",
    viatorSuggestions: [
      {
        title: "Skip-the-Line: São Jorge Castle Guided Tour",
        price: "€29",
        url: "https://www.viator.com/Lisbon-tours/Skip-the-Line-Tours/d712-g26-c151",
      },
    ],
  },
  {
    id: "lx-factory",
    name: "LX Factory",
    emoji: "🏭",
    description: "Industrial-chic creative district under the bridge.",
    lat: 38.7036,
    lng: -9.1786,
    points: 50,
    rarity: "common",
    viatorSuggestions: [
      {
        title: "Lisbon Street Art & LX Factory Tour",
        price: "€26",
        url: "https://www.viator.com/Lisbon-tours/Walking-Tours/d712-g3",
      },
    ],
  },
  {
    id: "ponte-25-de-abril",
    name: "Ponte 25 de Abril",
    emoji: "🌉",
    description: "Lisbon's red suspension bridge, viewable from many angles.",
    lat: 38.6896,
    lng: -9.1773,
    points: 70,
    rarity: "rare",
    viatorSuggestions: [
      {
        title: "Tagus River Sailing with Bridge Views",
        price: "€38",
        url: "https://www.viator.com/Lisbon-tours/Cruises-Sailing-Water-Tours/d712-g16",
      },
    ],
  },
  {
    id: "alfama-streets",
    name: "Alfama Old Town",
    emoji: "🏘️",
    description: "The oldest district. Narrow streets, fado, tile.",
    lat: 38.7115,
    lng: -9.1303,
    points: 50,
    rarity: "common",
    viatorSuggestions: [
      {
        title: "Alfama Walking Tour with Fado",
        price: "€34",
        url: "https://www.viator.com/Lisbon-tours/Walking-Tours/d712-g3",
      },
    ],
  },
  {
    id: "rossio-square",
    name: "Rossio Square",
    emoji: "⛲",
    description: "The wave-patterned heart of Lisbon's downtown.",
    lat: 38.7138,
    lng: -9.139,
    points: 40,
    rarity: "common",
    viatorSuggestions: [
      {
        title: "Lisbon Tile & Tradition Walking Tour",
        price: "€24",
        url: "https://www.viator.com/Lisbon-tours/Walking-Tours/d712-g3",
      },
    ],
  },
  {
    id: "torre-vasco-da-gama",
    name: "Torre Vasco da Gama",
    emoji: "🗽",
    description: "Modern landmark at Parque das Nações.",
    lat: 38.7681,
    lng: -9.0938,
    points: 60,
    rarity: "rare",
    viatorSuggestions: [
      {
        title: "Parque das Nações & Oceanário Tour",
        price: "€31",
        url: "https://www.viator.com/Lisbon-tours/d712",
      },
    ],
  },
  {
    id: "miradouro-santa-luzia",
    name: "Miradouro de Santa Luzia",
    emoji: "🌺",
    description: "Tiled pergola overlooking Alfama and the river.",
    lat: 38.7117,
    lng: -9.1294,
    points: 50,
    rarity: "common",
    viatorSuggestions: [
      {
        title: "Tuk-Tuk Tour: 7 Hills, 7 Miradouros",
        price: "€39",
        url: "https://www.viator.com/Lisbon-tours/d712",
      },
    ],
  },
];

export function getLandmark(id: string): Landmark | undefined {
  return LANDMARKS.find((l) => l.id === id);
}

// Haversine distance in meters.
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
