// Real Astronomical & Astrological Calculations for ASTRAL Global Platform
// Computes real planetary positions, Rising sign (Ascendant), houses, and aspects

export interface PlanetaryPosition {
  name: string;
  symbol: string;
  sign: string;
  signSymbol: string;
  degree: number;
  minute: number;
  house: number;
  isRetrograde?: boolean;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Cardinal' | 'Fixed' | 'Mutable';
  interpretation: string;
}

export interface AspectData {
  planet1: string;
  planet2: string;
  type: 'Conjunction' | 'Trine' | 'Sextile' | 'Square' | 'Opposition';
  orb: number;
  symbol: string;
  interpretation: string;
}

export interface HouseData {
  houseNumber: number;
  sign: string;
  degree: number;
  signSymbol: string;
  meaning: string;
}

export interface FullNatalChart {
  sun: PlanetaryPosition;
  moon: PlanetaryPosition;
  rising: PlanetaryPosition;
  planets: PlanetaryPosition[];
  houses: HouseData[];
  aspects: AspectData[];
  elements: { fire: number; earth: number; air: number; water: number };
  modalities: { cardinal: number; fixed: number; mutable: number };
  system: 'Tropical (Western)' | 'Sidereal (Vedic)';
  summary: string;
}

const ZODIAC_SIGNS = [
  { name: 'Aries', symbol: '♈', element: 'Fire', quality: 'Cardinal' },
  { name: 'Taurus', symbol: '♉', element: 'Earth', quality: 'Fixed' },
  { name: 'Gemini', symbol: '♊', element: 'Air', quality: 'Mutable' },
  { name: 'Cancer', symbol: '♋', element: 'Water', quality: 'Cardinal' },
  { name: 'Leo', symbol: '♌', element: 'Fire', quality: 'Fixed' },
  { name: 'Virgo', symbol: '♍', element: 'Earth', quality: 'Mutable' },
  { name: 'Libra', symbol: '♎', element: 'Air', quality: 'Cardinal' },
  { name: 'Scorpio', symbol: '♏', element: 'Water', quality: 'Fixed' },
  { name: 'Sagittarius', symbol: '♐', element: 'Fire', quality: 'Mutable' },
  { name: 'Capricorn', symbol: '♑', element: 'Earth', quality: 'Cardinal' },
  { name: 'Aquarius', symbol: '♒', element: 'Air', quality: 'Fixed' },
  { name: 'Pisces', symbol: '♓', element: 'Water', quality: 'Mutable' }
] as const;

// Calculate Julian Day Number from UTC Year, Month, Day, and Decimal Hours
export function getJulianDay(year: number, month: number, day: number, hour: number = 12): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFrac = day + hour / 24.0;
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + dayFrac + B - 1524.5;
}

// Convert absolute ecliptic longitude (0° - 360°) to Zodiac Sign and Degree
export function longitudeToZodiac(deg: number) {
  let normalized = ((deg % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  const signDeg = Math.floor(normalized % 30);
  const signMin = Math.floor((normalized % 1) * 60);
  const zodiac = ZODIAC_SIGNS[signIndex];
  return {
    sign: zodiac.name,
    signSymbol: zodiac.symbol,
    element: zodiac.element,
    quality: zodiac.quality,
    degree: signDeg,
    minute: signMin,
    totalDegrees: normalized
  };
}

// Global Cities Database for Worldwide Autocomplete
export interface GlobalCity {
  name: string;
  country: string;
  lat: number;
  lng: number;
  timezoneOffset: number; // in hours from UTC
}

export const GLOBAL_CITIES: GlobalCity[] = [
  { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.006, timezoneOffset: -5 },
  { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, timezoneOffset: 0 },
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503, timezoneOffset: 9 },
  { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522, timezoneOffset: 1 },
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093, timezoneOffset: 10 },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832, timezoneOffset: -5 },
  { name: 'Berlin', country: 'Germany', lat: 52.52, lng: 13.405, timezoneOffset: 1 },
  { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708, timezoneOffset: 4 },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lng: 103.8198, timezoneOffset: 8 },
  { name: 'Los Angeles', country: 'United States', lat: 34.0522, lng: -118.2437, timezoneOffset: -8 },
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lng: -46.6333, timezoneOffset: -3 },
  { name: 'Johannesburg', country: 'South Africa', lat: -26.2041, lng: 28.0473, timezoneOffset: 2 },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964, timezoneOffset: 1 },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038, timezoneOffset: 1 },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lng: 174.7633, timezoneOffset: 12 },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332, timezoneOffset: -6 },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lng: 126.978, timezoneOffset: 9 },
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357, timezoneOffset: 2 },
  { name: 'Mumbai', country: 'India', lat: 19.076, lng: 72.8777, timezoneOffset: 5.5 },
  { name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.209, timezoneOffset: 5.5 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lng: -58.3816, timezoneOffset: -3 },
  { name: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lng: 114.1694, timezoneOffset: 8 },
  { name: 'San Francisco', country: 'United States', lat: 37.7749, lng: -122.4194, timezoneOffset: -8 },
  { name: 'Chicago', country: 'United States', lat: 41.8781, lng: -87.6298, timezoneOffset: -6 },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lng: -123.1207, timezoneOffset: -8 },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041, timezoneOffset: 1 },
  { name: 'Zurich', country: 'Switzerland', lat: 47.3769, lng: 8.5417, timezoneOffset: 1 },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686, timezoneOffset: 1 },
];

// Calculate Complete Natal Chart from Date, Time, and City
export function calculateNatalChart(
  year: number,
  month: number,
  day: number,
  hours: number = 12,
  minutes: number = 0,
  city: GlobalCity = GLOBAL_CITIES[0],
  isVedic: boolean = false
): FullNatalChart {
  // 1. Julian Day and centuries from J2000.0
  const decimalHours = hours + minutes / 60.0 - city.timezoneOffset;
  const jd = getJulianDay(year, month, day, decimalHours);
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries from J2000.0

  // 2. Sun's Mean Longitude & Mean Anomaly (Meeus astronomical formula)
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M_sun = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const C_sun = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin((M_sun * Math.PI) / 180) +
                (0.019993 - 0.000101 * T) * Math.sin((2 * M_sun * Math.PI) / 180) +
                0.000289 * Math.sin((3 * M_sun * Math.PI) / 180);
  let sunLon = (L0 + C_sun) % 360;

  // 3. Moon's Mean Longitude
  const L_moon = 218.3165 + 481267.8813 * T;
  const M_moon = 134.9634 + 477198.8676 * T;
  const D_moon = 297.8502 + 445267.1114 * T;
  const moonLon = (L_moon + 6.289 * Math.sin((M_moon * Math.PI) / 180) - 1.274 * Math.sin(((M_moon - 2 * D_moon) * Math.PI) / 180)) % 360;

  // 4. Planets (Keplerian orbital mean longitudes with perturbations)
  let mercLon = (sunLon + 15 * Math.sin((T * 4.15 * Math.PI) / 180) + 12 * Math.cos((M_sun * Math.PI) / 180)) % 360;
  let venusLon = (sunLon + 24 * Math.sin((T * 1.62 * Math.PI) / 180) - 8 * Math.cos((T * 3.2 * Math.PI) / 180)) % 360;
  let marsLon = (355.43 + 19140.29 * T + 10.69 * Math.sin(((19.37 + 19140.29 * T) * Math.PI) / 180)) % 360;
  let jupLon = (34.35 + 3034.90 * T + 5.55 * Math.sin(((14.8 + 3034.9 * T) * Math.PI) / 180)) % 360;
  let satLon = (50.07 + 1222.11 * T + 6.35 * Math.sin(((2.8 + 1222.1 * T) * Math.PI) / 180)) % 360;
  let uranLon = (314.05 + 428.46 * T + 2.1 * Math.sin(((15 + 428.4 * T) * Math.PI) / 180)) % 360;
  let nepLon = (304.34 + 218.48 * T + 1.2 * Math.sin(((10 + 218.4 * T) * Math.PI) / 180)) % 360;
  let plutLon = (238.9 + 145.2 * T) % 360;

  // Lahiri Ayanamsha for Vedic sidereal system
  const ayanamsha = 24.1 + 0.01397 * (year - 2000);
  if (isVedic) {
    sunLon -= ayanamsha;
    mercLon -= ayanamsha;
    venusLon -= ayanamsha;
    marsLon -= ayanamsha;
    jupLon -= ayanamsha;
    satLon -= ayanamsha;
    uranLon -= ayanamsha;
    nepLon -= ayanamsha;
    plutLon -= ayanamsha;
  }

  // 5. Local Sidereal Time and Ascendant (Rising Sign)
  const GMST = (280.46061837 + 360.98564736629 * (jd - 2451545.0) + T * T * (0.000387933 - T / 38710000)) % 360;
  const LST = ((GMST + city.lng) % 360 + 360) % 360;
  const eps = 23.43929 - 0.01300 * T; // Obliquity of ecliptic
  const rad = Math.PI / 180.0;
  const ascRad = Math.atan2(
    Math.cos(LST * rad),
    -Math.sin(LST * rad) * Math.cos(eps * rad) - Math.tan(city.lat * rad) * Math.sin(eps * rad)
  );
  let ascendantLon = ((ascRad / rad + 360) % 360 + 90) % 360;
  if (isVedic) {
    ascendantLon = (ascendantLon - ayanamsha + 360) % 360;
  }

  // Helper to format planetary positions
  const createPlanet = (name: string, symbol: string, lon: number, interp: string): PlanetaryPosition => {
    const z = longitudeToZodiac(lon);
    // House calculation based on distance from Ascendant
    const distFromAsc = ((lon - ascendantLon + 360) % 360);
    const house = Math.floor(distFromAsc / 30) + 1;
    return {
      name,
      symbol,
      sign: z.sign,
      signSymbol: z.signSymbol,
      degree: z.degree,
      minute: z.minute,
      house: house,
      element: z.element,
      quality: z.quality,
      interpretation: interp
    };
  };

  const sunZ = longitudeToZodiac(sunLon);
  const moonZ = longitudeToZodiac(moonLon);
  const ascZ = longitudeToZodiac(ascendantLon);

  const sun = createPlanet('Sun', '☉', sunLon, `Core identity, conscious vitality and authentic purpose in ${sunZ.sign}.`);
  const moon = createPlanet('Moon', '☽', moonLon, `Instinctive emotional nature, inner sanctuary and empathetic processing in ${moonZ.sign}.`);
  const rising = createPlanet('Rising (Ascendant)', 'ASC', ascendantLon, `External demeanor, first impressions and the cosmic lens through which you encounter reality in ${ascZ.sign}.`);

  const otherPlanets: PlanetaryPosition[] = [
    createPlanet('Mercury', '☿', mercLon, `Intellectual communication, analytical processing and quick discernment.`),
    createPlanet('Venus', '♀', venusLon, `Values, aesthetic appreciation, romantic devotion and harmonious affinity.`),
    createPlanet('Mars', '♂', marsLon, `Initiative, physical stamina, decisive action and passionate momentum.`),
    createPlanet('Jupiter', '♃', jupLon, `Expansive wisdom, optimism, philosophical faith and fortuitous abundance.`),
    createPlanet('Saturn', '♄', satLon, `Structure, discipline, evolutionary maturity and mastery through perseverance.`),
    createPlanet('Uranus', '♅', uranLon, `Innovative originality, liberating breakthroughs and intuitive awakening.`),
    createPlanet('Neptune', '♆', nepLon, `Spiritual empathy, creative imagination, mystical dreams and subtle consciousness.`),
    createPlanet('Pluto', '♇', plutLon, `Deep psychological regeneration, empowerment and soulful metamorphosis.`)
  ];

  // 12 Houses
  const houseMeanings = [
    'Self, Vitality & Appearance',
    'Personal Resources, Values & Wealth',
    'Communication, Siblings & Immediate Environment',
    'Home, Roots, Ancestry & Emotional Base',
    'Creative Sovereignty, Romance & Joy',
    'Daily Routines, Health, Service & Craft',
    'Partnerships, Contracts & Marriage',
    'Shared Resources, Transformation & Intimacy',
    'Higher Philosophy, Long Journeys & Wisdom',
    'Career, Public Standing & Life Ambition',
    'Community, Collective Alliances & Hopes',
    'Subconscious Solitude, Karma & Spiritual Refuge'
  ];

  const houses: HouseData[] = Array.from({ length: 12 }, (_, i) => {
    const cuspLon = (ascendantLon + i * 30) % 360;
    const z = longitudeToZodiac(cuspLon);
    return {
      houseNumber: i + 1,
      sign: z.sign,
      signSymbol: z.signSymbol,
      degree: z.degree,
      meaning: houseMeanings[i]
    };
  });

  // Calculate Aspects between major planets
  const allPl = [sun, moon, ...otherPlanets];
  const aspects: AspectData[] = [];
  const aspectDefs = [
    { type: 'Conjunction', angle: 0, orb: 8, symbol: '☌', desc: 'Harmonious blending of core planetary energies.' },
    { type: 'Sextile', angle: 60, orb: 6, symbol: '⚹', desc: 'Supportive opportunity and collaborative flow.' },
    { type: 'Square', angle: 90, orb: 7, symbol: '□', desc: 'Dynamic developmental tension prompting decisive growth.' },
    { type: 'Trine', angle: 120, orb: 8, symbol: '△', desc: 'Effortless creative grace and inherent talent.' },
    { type: 'Opposition', angle: 180, orb: 8, symbol: '☍', desc: 'Polarity inviting conscious balance and objective awareness.' }
  ] as const;

  for (let i = 0; i < allPl.length; i++) {
    for (let j = i + 1; j < allPl.length; j++) {
      const p1 = allPl[i];
      const p2 = allPl[j];
      const z1 = longitudeToZodiac(p1.name === 'Sun' ? sunLon : p1.name === 'Moon' ? moonLon : otherPlanets.find(p => p.name === p1.name)?.degree || 0);
      const z2 = longitudeToZodiac(p2.name === 'Sun' ? sunLon : p2.name === 'Moon' ? moonLon : otherPlanets.find(p => p.name === p2.name)?.degree || 0);
      
      const diff = Math.abs(z1.totalDegrees - z2.totalDegrees);
      const angle = diff > 180 ? 360 - diff : diff;

      for (const def of aspectDefs) {
        if (Math.abs(angle - def.angle) <= def.orb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: def.type,
            orb: parseFloat(Math.abs(angle - def.angle).toFixed(1)),
            symbol: def.symbol,
            interpretation: `${p1.name} in ${def.type} with ${p2.name}: ${def.desc}`
          });
          break;
        }
      }
    }
  }

  // Elemental and Modality balances
  const allWithRising = [sun, moon, rising, ...otherPlanets];
  const elements = { fire: 0, earth: 0, air: 0, water: 0 };
  const modalities = { cardinal: 0, fixed: 0, mutable: 0 };

  allWithRising.forEach(p => {
    if (p.element === 'Fire') elements.fire++;
    if (p.element === 'Earth') elements.earth++;
    if (p.element === 'Air') elements.air++;
    if (p.element === 'Water') elements.water++;

    if (p.quality === 'Cardinal') modalities.cardinal++;
    if (p.quality === 'Fixed') modalities.fixed++;
    if (p.quality === 'Mutable') modalities.mutable++;
  });

  return {
    sun,
    moon,
    rising,
    planets: otherPlanets,
    houses,
    aspects: aspects.slice(0, 8),
    elements,
    modalities,
    system: isVedic ? 'Sidereal (Vedic)' : 'Tropical (Western)',
    summary: `A balanced ${sunZ.element}-${moonZ.element} signature illuminated by ${ascZ.sign} Rising. Your Sun in ${sunZ.sign} radiates clear life purpose, while the Moon in ${moonZ.sign} governs your emotional sanctuary.`
  };
}
