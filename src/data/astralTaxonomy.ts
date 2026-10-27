export interface TaxonomyLeaf {
  id: string;
  name: string;
  description?: string;
  badge?: string;
  toolType?: 'calculator' | 'article' | 'tarot' | 'quiz' | 'chart' | 'compatibility' | 'oracle' | 'report' | 'settings';
}

export interface TaxonomySubCategory {
  id: string;
  name: string;
  description?: string;
  items?: (string | TaxonomyLeaf)[];
  subGroups?: {
    name: string;
    items: (string | TaxonomyLeaf)[];
  }[];
}

export interface TaxonomyCategory {
  id: string;
  name: string;
  icon: string;
  summary: string;
  color: string;
  subCategories: TaxonomySubCategory[];
}

export const ASTRAL_TAXONOMY: TaxonomyCategory[] = [
  // 1. 🏠 HOME
  {
    id: 'home',
    name: 'HOME',
    icon: '🏠',
    summary: 'The Consecrated Sanctuary Portal, Live Consultations & Daily Celestial Ephemeris',
    color: '#d4af37',
    subCategories: [
      {
        id: 'home-sections',
        name: 'Home Sanctuary Features',
        items: [
          { id: 'sanctuary-hub', name: 'Celestial Transits Hub', description: 'Daily celestial alignments and cosmic vitality scores' },
          { id: 'readers-collective', name: 'The Reader Collective', description: 'Live 1-on-1 consultations with verified spiritual masters (15+ years experience)' },
          { id: 'daily-horoscope-portal', name: 'Daily Zodiac Transits', description: 'Real-time ephemeris transits and advice for all 12 signs' },
          { id: 'rituals-and-spells', name: 'Rituals & Love Spells', description: 'Consecrated ceremonies, love bindings, and aura cleansings' },
          { id: 'astral-shop-portal', name: 'The LUMSIC Shop', description: 'Purified crystals, sacred amulets, and consecrated beeswax candles' },
          { id: 'free-offer', name: 'First Free Chat Consultation', description: 'Complimentary introductory session for all new seekers' }
        ]
      }
    ]
  },

  // 2. 🔮 COSMIC TRADITIONS
  {
    id: 'astrology',
    name: 'COSMIC TRADITIONS',
    icon: '🔮',
    summary: 'Western, Vedic, Chinese, Mayan & Ancient Wisdom',
    color: '#9d4edd',
    subCategories: [
      {
        id: 'western-astrology',
        name: 'Western Traditions',
        description: 'Tropical zodiac system based on cardinal solar cycles and planetary archetypes',
        subGroups: [
          {
            name: 'Zodiac Signs',
            items: [
              { id: 'aries', name: 'Aries', description: '♈ Cardinal Fire • Ruled by Mars • Bold initiative, courage and vitality' },
              { id: 'taurus', name: 'Taurus', description: '♉ Fixed Earth • Ruled by Venus • Serenity, sensual grounding and endurance' },
              { id: 'gemini', name: 'Gemini', description: '♊ Mutable Air • Ruled by Mercury • Quick intellect, duality and curiosity' },
              { id: 'cancer', name: 'Cancer', description: '♋ Cardinal Water • Ruled by the Moon • Intuitive empathy, emotional refuge and devotion' },
              { id: 'leo', name: 'Leo', description: '♌ Fixed Fire • Ruled by the Sun • Radiant warmth, creative sovereignty and joy' },
              { id: 'virgo', name: 'Virgo', description: '♍ Mutable Earth • Ruled by Mercury • Discernment, healing precision and service' },
              { id: 'libra', name: 'Libra', description: '♎ Cardinal Air • Ruled by Venus • Harmony, partnership grace and diplomacy' },
              { id: 'scorpio', name: 'Scorpio', description: '♏ Fixed Water • Ruled by Pluto & Mars • Alchemical truth, rebirth and passion' },
              { id: 'sagittarius', name: 'Sagittarius', description: '♐ Mutable Fire • Ruled by Jupiter • Quest for truth, philosophy and optimism' },
              { id: 'capricorn', name: 'Capricorn', description: '♑ Cardinal Earth • Ruled by Saturn • Mountain discipline, legacy and mastery' },
              { id: 'aquarius', name: 'Aquarius', description: '♒ Fixed Air • Ruled by Uranus & Saturn • Visionary innovation and humanity' },
              { id: 'pisces', name: 'Pisces', description: '♓ Mutable Water • Ruled by Neptune & Jupiter • Mystical unity, compassion and dreams' }
            ]
          },
          {
            name: 'Western Pillars & Dynamics',
            items: [
              { id: 'planets', name: 'Planets', description: 'Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto' },
              { id: 'houses', name: 'Houses', description: 'The 12 cosmic houses of life domain experience' },
              { id: 'aspects', name: 'Aspects', description: 'Conjunctions, sextiles, squares, trines and oppositions' },
              { id: 'transits', name: 'Transits', description: 'Current planetary movements activating your natal blueprint' },
              { id: 'retrogrades', name: 'Retrogrades', description: 'Planetary retrograde cycles, shadow periods and inward reflection' },
              { id: 'astrology-basics', name: 'Chart Basics', description: 'Elements, modalities, polarities and chart wheel navigation' }
            ]
          }
        ]
      },
      {
        id: 'vedic-astrology',
        name: 'Vedic Jyotish',
        description: 'Sacred sidereal Jyotish tracing back to the ancient Vedic Rishis',
        items: [
          { id: 'kundli', name: 'Kundli', description: 'Vedic natal birth chart (Janampatri) with bhava house divisions' },
          { id: 'rashi', name: 'Rashi', description: 'Sidereal Moon sign governing subconscious nature and emotional karma' },
          { id: 'lagna', name: 'Lagna', description: 'Rising sign constellation establishing the physical life path' },
          { id: 'nakshatra', name: 'Nakshatra', description: 'The 27 sacred lunar mansions from Ashwini to Revati' },
          { id: 'dasha', name: 'Dasha', description: 'Vimshottari 120-year planetary timeline governing life chapters' },
          { id: 'mahadasha', name: 'Mahadasha', description: 'Major ruling planetary period lasting 6 to 20 years' },
          { id: 'antardasha', name: 'Antardasha', description: 'Sub-period within a Mahadasha dictating near-term life events' },
          { id: 'navamsa', name: 'Navamsa', description: 'D9 spiritual soul chart revealing marital destiny and inner evolution' },
          { id: 'manglik', name: 'Manglik', description: 'Mars placement evaluation and sacred harmonizing remedies' },
          { id: 'sade-sati', name: 'Sade Sati', description: 'Saturn’s 7.5-year transformative transit over natal Moon' }
        ]
      },
      {
        id: 'other-astrology-traditions',
        name: 'Other Ancient Traditions',
        items: [
          { id: 'chinese-astrology', name: 'Chinese Zodiac', description: '12 Animal signs, Yin/Yang balance, and Five Elements (Wood, Fire, Earth, Metal, Water)' },
          { id: 'mayan-astrology', name: 'Mayan Sacred Calendar', description: 'Tzolk’in sacred 260-day calendar and 20 Solar Day Signs' },
          { id: 'astrology-traditions', name: 'Ancient Ephemeris Traditions', description: 'Hellenistic, Medieval Arabic, Celtic, and Evolutionary traditions' }
        ]
      }
    ]
  },

  // 3. 🌙 HOROSCOPE
  {
    id: 'horoscope',
    name: 'HOROSCOPE',
    icon: '🌙',
    summary: 'Temporal Ephemeris & Domain Forecasts for All 12 Signs',
    color: '#e0a96d',
    subCategories: [
      {
        id: 'temporal-horoscopes',
        name: 'Temporal Horoscopes',
        items: [
          { id: 'daily-horoscope', name: 'Daily Horoscope', description: 'Daily planetary transits, scores and lucky numbers updated every morning' },
          { id: 'weekly-horoscope', name: 'Weekly Horoscope', description: '7-day lunar progression and weekly cosmic alignment forecast' },
          { id: 'monthly-horoscope', name: 'Monthly Horoscope', description: 'Comprehensive monthly calendar, new moon intentions and full moon release' },
          { id: 'yearly-horoscope', name: 'Yearly Horoscope', description: 'Annual macro-trends, eclipses and outer planet ingresses' }
        ]
      },
      {
        id: 'domain-horoscopes',
        name: 'Domain & Zodiac Horoscopes',
        items: [
          { id: 'love-horoscope', name: 'Love Horoscope', description: 'Venus & Mars romantic chemistry, attraction and relationship guidance' },
          { id: 'career-horoscope', name: 'Career Horoscope', description: '10th House Midheaven and Saturn transits for professional progress' },
          { id: 'money-horoscope', name: 'Money Horoscope', description: '2nd and 8th House financial luck, wealth tides and prosperity windows' },
          { id: 'zodiac-horoscope', name: 'Zodiac Horoscope', description: 'Complete deep dive archetype ephemeris for all 12 signs' }
        ]
      }
    ]
  },

  // 4. 🌌 BIRTH CHART
  {
    id: 'birth-chart',
    name: 'BIRTH CHART',
    icon: '🌌',
    summary: 'Complete Natal Snapshot, Big Three, Planetary Degrees & House Angles',
    color: '#4cc9f0',
    subCategories: [
      {
        id: 'birth-chart-core',
        name: 'Core Wheel & Primals',
        items: [
          { id: 'birth-chart-calculator', name: 'Birth Chart Calculator', description: 'Generate high-resolution natal wheel with exact degrees and house cusps', toolType: 'calculator' },
          { id: 'natal-chart', name: 'Natal Chart', description: 'Full holistic synthesis of your celestial incarnation blueprint' },
          { id: 'sun-sign', name: 'Sun Sign', description: 'Your vital core consciousness, life purpose, and solar radiance' },
          { id: 'moon-sign', name: 'Moon Sign', description: 'Your emotional sanctuary, instinctive reactions, and subconscious needs' },
          { id: 'rising-sign', name: 'Rising Sign', description: 'Your outward persona, first impression, and sacred physical gateway' },
          { id: 'ascendant', name: 'Ascendant', description: 'The exact eastern horizon degree determining all 12 house positions' }
        ]
      },
      {
        id: 'birth-chart-planets',
        name: 'Planetary Signs & Positions',
        items: [
          { id: 'mercury-sign', name: 'Mercury Sign', description: 'Cognition, communication style, learning and expression' },
          { id: 'venus-sign', name: 'Venus Sign', description: 'Love language, aesthetic taste, social grace and devotion' },
          { id: 'mars-sign', name: 'Mars Sign', description: 'Drive, ambition, passionate energy and assertiveness' },
          { id: 'jupiter-sign', name: 'Jupiter Sign', description: 'Spiritual expansion, wisdom, good fortune and optimism' },
          { id: 'saturn-sign', name: 'Saturn Sign', description: 'Karmic lessons, boundaries, perseverance and mastery' },
          { id: 'uranus-sign', name: 'Uranus Sign', description: 'Originality, rebellion, intuition and sudden breakthroughs' },
          { id: 'neptune-sign', name: 'Neptune Sign', description: 'Dreams, mystical connection, glamour and spiritual sensitivity' },
          { id: 'pluto-sign', name: 'Pluto Sign', description: 'Soul transformation, psychological power and rebirth' },
          { id: 'planetary-positions', name: 'Planetary Positions', description: 'Full degree table with elemental weightings and retrograde flags' },
          { id: 'houses', name: 'Houses', description: 'The 1st through 12th houses of personal experience' },
          { id: 'aspects', name: 'Aspects', description: 'Geometric angles linking planets in the natal wheel' }
        ]
      }
    ]
  },

  // 5. 🧿 PSYCHIC
  {
    id: 'psychic',
    name: 'PSYCHIC',
    icon: '🧿',
    summary: 'The Six Clairs, Aura Perception, Mediumship & Extrasensory Arts',
    color: '#7209b7',
    subCategories: [
      {
        id: 'psychic-skills',
        name: 'Psychic Skills',
        description: 'The six subtle extrasensory perceptual senses',
        items: [
          { id: 'clairvoyance', name: 'Clairvoyance', description: 'Clear seeing • Visual perceptions through the third eye and astral sight' },
          { id: 'clairaudience', name: 'Clairaudience', description: 'Clear hearing • Receiving spiritual messages, whispers and musical frequencies' },
          { id: 'clairsentience', name: 'Clairsentience', description: 'Clear feeling • Empathic sensing of emotional and physical energetic fields' },
          { id: 'claircognizance', name: 'Claircognizance', description: 'Clear knowing • Direct intuitive downloads of unlearned truth from the Akasha' },
          { id: 'clairalience', name: 'Clairalience', description: 'Clear smelling • Sensing psychic aromas (incense, floral perfume, tobacco)' },
          { id: 'clairgustance', name: 'Clairgustance', description: 'Clear tasting • Experiencing subtle psychic taste sensations as validation' }
        ]
      },
      {
        id: 'psychic-practices',
        name: 'Psychic Development & Arts',
        items: [
          { id: 'intuition', name: 'Intuition', description: 'Tuning into the whisper of the quiet inner knowing' },
          { id: 'psychic-development', name: 'Psychic Development', description: 'Exercises, shielding rituals and third-eye activation' },
          { id: 'psychic-test', name: 'Psychic Test', description: 'Interactive card and symbol extrasensory perception evaluation', toolType: 'quiz' },
          { id: 'intuition-test', name: 'Intuition Test', description: 'Interactive quiz identifying your dominant psychic Clair channel', toolType: 'quiz' },
          { id: 'aura-reading', name: 'Aura Reading', description: 'Perceiving and interpreting human bio-electromagnetic energy fields' },
          { id: 'aura-colors', name: 'Aura Colors', description: 'Meanings of Gold, Violet, Indigo, Emerald, Blue, and Magenta auras' },
          { id: 'mediumship', name: 'Mediumship', description: 'Ethical communication with loved ones and guides in the spirit realm' },
          { id: 'energy-reading', name: 'Energy Reading', description: 'Scanning chakra vortexes and clearing energetic cords' },
          { id: 'dream-interpretation', name: 'Dream Interpretation', description: 'Decoding subconscious archetypes, lucid visions and prophetic dreams' },
          { id: 'remote-viewing', name: 'Remote Viewing', description: 'Coordinate remote sensing of distant targets and places' }
        ]
      }
    ]
  },

  // 6. 🔮 TAROT
  {
    id: 'tarot',
    name: 'TAROT',
    icon: '🔮',
    summary: 'Spreads, 78 Sacred Cards, Minor Arcana Suits & Hermetic Lore',
    color: '#b5179e',
    subCategories: [
      {
        id: 'tarot-readings-spreads',
        name: 'Tarot Reading Spreads',
        items: [
          { id: 'tarot-reading', name: 'Tarot Reading', description: 'General sacred divination reading with our verified elders' },
          { id: 'one-card-tarot', name: 'One Card Tarot', description: 'Instant single card draw for morning clarity or direct daily focus', toolType: 'tarot' },
          { id: 'three-card-tarot', name: 'Three Card Tarot', description: 'Classic Past / Present / Future timeline spread', toolType: 'tarot' },
          { id: 'yes-no-tarot', name: 'Yes / No Tarot', description: 'Direct binary answer with upright and reversed card interpretation', toolType: 'tarot' },
          { id: 'love-tarot', name: 'Love Tarot', description: 'Relationship intentions, mutual heart desires and hidden obstacles', toolType: 'tarot' },
          { id: 'career-tarot', name: 'Career Tarot', description: 'Vocation, financial decisions, and professional momentum' },
          { id: 'daily-tarot', name: 'Daily Tarot', description: 'Daily meditative pull attuned to current astrological currents' }
        ]
      },
      {
        id: 'arcana-and-meanings',
        name: 'Arcana Lore & Card Meanings',
        items: [
          { id: 'major-arcana', name: 'Major Arcana', description: '22 Archetypal Trump Cards representing the soul’s spiritual evolution' },
          { id: 'tarot-card-meanings', name: 'Tarot Card Meanings', description: 'Comprehensive directory of upright, reversed and astrological meanings' }
        ],
        subGroups: [
          {
            name: 'Minor Arcana',
            items: [
              { id: 'minor-wands', name: 'Wands', description: 'Suit of Fire • Passion, ambition, spiritual fire, creativity and willpower' },
              { id: 'minor-cups', name: 'Cups', description: 'Suit of Water • Emotions, love, relationships, intuition and compassion' },
              { id: 'minor-swords', name: 'Swords', description: 'Suit of Air • Intellect, truth, mental clarity, communication and struggle' },
              { id: 'minor-pentacles', name: 'Pentacles', description: 'Suit of Earth • Material abundance, finances, physical body, home and craft' }
            ]
          }
        ]
      }
    ]
  },

  // 7. 🔢 NUMEROLOGY
  {
    id: 'numerology',
    name: 'NUMEROLOGY',
    icon: '🔢',
    summary: 'Pythagorean & Chaldean Sacred Vibration of Numbers',
    color: '#3a0ca3',
    subCategories: [
      {
        id: 'numerology-core',
        name: 'Calculators & Core Numbers',
        items: [
          { id: 'numerology-calculator', name: 'Numerology Calculator', description: 'Calculate all 5 core blueprint numbers from your birth date and name', toolType: 'calculator' },
          { id: 'life-path-number', name: 'Life Path Number', description: 'The main highway of your incarnation (1-9, Master Numbers 11, 22, 33)' },
          { id: 'destiny-number', name: 'Destiny Number', description: 'Your lifelong mission and innate gifts derived from your birth name' },
          { id: 'expression-number', name: 'Expression Number', description: 'How you naturally channel and express your cosmic potential' },
          { id: 'soul-urge-number', name: 'Soul Urge Number', description: 'Heart’s desire derived from vowels — what your soul truly craves' },
          { id: 'personality-number', name: 'Personality Number', description: 'Derived from consonants — your energetic first impression on others' },
          { id: 'birthday-number', name: 'Birthday Number', description: 'Specific day of birth vibration conferring special talents' },
          { id: 'name-numerology', name: 'Name Numerology', description: 'Vibrational harmonisation of personal and business names' },
          { id: 'angel-numbers', name: 'Angel Numbers', description: 'Recurring sacred numbers (111, 222, 333, 444, 777, 888, 1111)' }
        ]
      }
    ]
  },

  // 8. ❤️ COMPATIBILITY
  {
    id: 'compatibility',
    name: 'COMPATIBILITY',
    icon: '❤️',
    summary: 'Synastry, Composite Charts & Relational Harmony',
    color: '#f72585',
    subCategories: [
      {
        id: 'compatibility-types',
        name: 'Relational Dimensions',
        items: [
          { id: 'zodiac-compatibility', name: 'Zodiac Compatibility', description: 'Elemental and modal alignment between any two astrological signs' },
          { id: 'love-compatibility', name: 'Love Compatibility', description: 'Venus and Mars harmony for romantic intimacy and desire' },
          { id: 'relationship-compatibility', name: 'Relationship Compatibility', description: 'Long-term mutual growth, emotional security and longevity' },
          { id: 'marriage-compatibility', name: 'Marriage Compatibility', description: 'Sacred marital commitment and Vedic Ashtakoota Guna Milan' },
          { id: 'friendship-compatibility', name: 'Friendship Compatibility', description: 'Intellectual rapport, trust, loyalty and soul tribe connection' },
          { id: 'synastry', name: 'Synastry', description: 'Inter-chart planetary overlay showing how each partner affects the other' },
          { id: 'composite-chart', name: 'Composite Chart', description: 'The midpoint chart representing the relationship as its own living entity' }
        ]
      }
    ]
  },

  // 9. 🕯️ SPIRITUALITY
  {
    id: 'spirituality',
    name: 'SPIRITUALITY',
    icon: '🕯️',
    summary: 'Inner Alchemy, Chakras, Healing Crystals & Lunar Cycles',
    color: '#06d6a0',
    subCategories: [
      {
        id: 'spiritual-practices',
        name: 'Spiritual Practices',
        items: [
          { id: 'meditation', name: 'Meditation', description: 'Stillness practices to calm the ego and commune with higher consciousness' },
          { id: 'manifestation', name: 'Manifestation', description: 'Aligning frequency, quantum intention and emotional resonance' },
          { id: 'affirmations', name: 'Affirmations', description: 'High-frequency verbal decrees to reprogram the subconscious auric field' },
          { id: 'chakras', name: 'Chakras', description: 'The 7 major energy vortexes from Root to Crown' },
          { id: 'crystals', name: 'Crystals', description: 'Metaphysical healing properties of quartz, tourmaline, amethyst and selenite' },
          { id: 'energy', name: 'Energy', description: 'Subtle life-force (Prana/Qi) stewardship, auric hygiene and grounding' },
          { id: 'spiritual-awakening', name: 'Spiritual Awakening', description: 'Navigating ego shifts, dark nights of the soul, and remembrance' }
        ]
      },
      {
        id: 'dreams-and-lunar',
        name: 'Dreams & Moon Tides',
        items: [
          { id: 'dreams', name: 'Dreams', description: 'Astral travel, subconscious reflection and dreamwork journals' },
          { id: 'dream-meanings', name: 'Dream Meanings', description: 'Spiritual interpretations of recurring symbols, water, flight and teeth' },
          { id: 'moon-phases', name: 'Moon Phases', description: 'The 8 lunar phases and their specific spiritual ritual timings' },
          { id: 'full-moon', name: 'Full Moon', description: 'Illumination, release rituals, crystal cleansing and intuitive peak' },
          { id: 'new-moon', name: 'New Moon', description: 'Seed planting, fresh intentions, dark void contemplation and beginnings' }
        ]
      }
    ]
  },

  // 10. 🛠️ FREE TOOLS
  {
    id: 'free-tools',
    name: 'FREE TOOLS',
    icon: '🛠️',
    summary: '16 Instant Interactive Astrological & Divination Calculators',
    color: '#118ab2',
    subCategories: [
      {
        id: 'free-tools-list',
        name: '16 Instant Calculators',
        items: [
          { id: 'birth-chart-calculator-tool', name: 'Birth Chart Calculator', description: 'Generate high-resolution natal chart wheel', toolType: 'calculator', badge: 'Popular' },
          { id: 'moon-sign-calculator', name: 'Moon Sign Calculator', description: 'Find your precise emotional Moon sign', toolType: 'calculator' },
          { id: 'rising-sign-calculator', name: 'Rising Sign Calculator', description: 'Compute exact Ascendant degree with birth time', toolType: 'calculator' },
          { id: 'sun-sign-calculator', name: 'Sun Sign Calculator', description: 'Discover solar core sign with cusp precision', toolType: 'calculator' },
          { id: 'compatibility-calculator', name: 'Compatibility Calculator', description: 'Calculate romance and harmony score between two signs', toolType: 'compatibility', badge: 'Love' },
          { id: 'kundli-calculator', name: 'Kundli Calculator', description: 'Generate Vedic birth chart (Janampatri)', toolType: 'calculator', badge: 'Vedic' },
          { id: 'kundli-matching', name: 'Kundli Matching', description: 'Ashtakoota 36 Guna marriage compatibility analysis', toolType: 'calculator' },
          { id: 'rashi-calculator', name: 'Rashi Calculator', description: 'Identify your sidereal Vedic Moon sign', toolType: 'calculator' },
          { id: 'nakshatra-calculator', name: 'Nakshatra Calculator', description: 'Calculate your birth lunar mansion and charan pada', toolType: 'calculator' },
          { id: 'life-path-calculator', name: 'Life Path Calculator', description: 'Instant Pythagorean Life Path sum', toolType: 'calculator' },
          { id: 'angel-number-calculator', name: 'Angel Number Calculator', description: 'Look up repeating number synchronicities', toolType: 'calculator' },
          { id: 'tarot-reading-tool', name: 'Tarot Reading', description: 'Draw 3 consecrated virtual tarot cards', toolType: 'tarot' },
          { id: 'psychic-test-tool', name: 'Psychic Test', description: 'Test your remote sensing intuition score', toolType: 'quiz' },
          { id: 'intuition-test-tool', name: 'Intuition Test', description: 'Evaluate your strongest Clair channel', toolType: 'quiz' },
          { id: 'aura-quiz', name: 'Aura Quiz', description: 'Determine the predominant color of your energy field', toolType: 'quiz' },
          { id: 'moon-calendar', name: 'Moon Calendar', description: 'Live interactive lunar phase ephemeris', toolType: 'calculator' }
        ]
      }
    ]
  },

  // 11. 📚 LEARN
  {
    id: 'learn',
    name: 'LEARN',
    icon: '📚',
    summary: 'Sanctuary Masterclasses, Beginner Guides & Astrology Glossary',
    color: '#073b4c',
    subCategories: [
      {
        id: 'curriculum',
        name: 'The Mystical Curriculum',
        items: [
          { id: 'learn-astrology', name: 'Astrology', description: 'Foundational guide to signs, houses, planets and chart wheel mechanics' },
          { id: 'learn-birth-charts', name: 'Birth Charts', description: 'How to read and interpret a natal wheel like an elder' },
          { id: 'learn-zodiac-signs', name: 'Zodiac Signs', description: 'Archetypal psychology, evolutionary lessons and shadow traits' },
          { id: 'learn-vedic-astrology', name: 'Vedic Astrology', description: 'Introduction to sidereal Jyotish, Dashas, and remedies' },
          { id: 'learn-psychic', name: 'Psychic', description: 'Cultivating extrasensory perception ethically and safely' },
          { id: 'learn-tarot', name: 'Tarot', description: 'Connecting intuitively with the 78 keys of esoteric symbolism' },
          { id: 'learn-numerology', name: 'Numerology', description: 'The sacred vibrational mathematics of Pythagoras' },
          { id: 'learn-spirituality', name: 'Spirituality', description: 'Building home altars, sacred space clearing and rituals' },
          { id: 'beginner-guides', name: 'Beginner Guides', description: 'Curated quick starts for seekers taking their first steps' },
          { id: 'astrology-glossary', name: 'Astrology Glossary', description: 'A-Z directory of astrological, Vedic and esoteric terms' }
        ]
      }
    ]
  },

  // 12. 👨🔮 EXPERTS
  {
    id: 'experts',
    name: 'EXPERTS',
    icon: '👨🔮',
    summary: '20 Verified Readers, Vedic Masters, Psychics & Tarot Elders',
    color: '#f4a261',
    subCategories: [
      {
        id: 'expert-specialties',
        name: 'Directory of Verified Masters (15+ Years Experience)',
        items: [
          { id: 'find-expert', name: 'Find an Expert', description: 'Full directory filterable by method, status, rate and rating' },
          { id: 'astrologers', name: 'Readers & Advisors', description: 'Specialists in psychological, predictive and evolutionary guidance' },
          { id: 'western-astrologers', name: 'Western Readers', description: 'Hellenistic and modern psychological advisors' },
          { id: 'vedic-astrologers', name: 'Vedic Acharyas', description: 'Jyotish acharyas skilled in Kundli, Dashas and sacred remedies' },
          { id: 'tarot-readers', name: 'Tarot Readers', description: 'Hermetic and intuitive masters of the 78-card deck' },
          { id: 'psychics', name: 'Psychics', description: 'Evidential psychics, clairvoyants and aura scanners' },
          { id: 'numerologists', name: 'Numerologists', description: 'Chaldean and Pythagorean vibrational timing experts' },
          { id: 'spiritual-coaches', name: 'Spiritual Coaches', description: 'Holistic mentors for shadow work, awakening and soul purpose' }
        ]
      }
    ]
  },

  // 13. 👥 COMMUNITY
  {
    id: 'community',
    name: 'COMMUNITY',
    icon: '👥',
    summary: 'Spiritual Circles, Questions & Seekers Discussion Forums',
    color: '#2a9d8f',
    subCategories: [
      {
        id: 'community-hubs',
        name: 'Discussion Forums & Circles',
        items: [
          { id: 'community-questions', name: 'Questions', description: 'Post inquiries to the sanctuary community and receive grounded wisdom' },
          { id: 'community-discussions', name: 'Discussions', description: 'Open forums on esoteric philosophy, awakenings and synchronicities' },
          { id: 'community-astrology', name: 'Astrology', description: 'Current retrogrades, eclipse portals and transit experiences' },
          { id: 'community-tarot', name: 'Tarot', description: 'Share card pulls and collaborate on spread interpretations' },
          { id: 'community-psychic', name: 'Psychic', description: 'Discussions on precognitive dreams, astral visions and signs' },
          { id: 'community-relationships', name: 'Relationships', description: 'Twin flames, soulmates and karmic contracts' },
          { id: 'community-numerology', name: 'Numerology', description: 'Personal year cycles, name calculations and angel numbers' },
          { id: 'community-spirituality', name: 'Spirituality', description: 'Altar photos, crystal grids and lunar ceremony recipes' }
        ]
      }
    ]
  },

  // 14. 🤖 ASK ASTRAL
  {
    id: 'ask-astral',
    name: 'ASK ASTRAL',
    icon: '🤖',
    summary: 'Instant Celestial Oracle for In-Depth Astrological & Mystical Guidance',
    color: '#d4af37',
    subCategories: [
      {
        id: 'ask-astral-channels',
        name: 'Oracle Inquiries by Domain',
        items: [
          { id: 'ask-astrology', name: 'Ask About Astrology', description: 'Instant clarity on planetary placements, aspects and transits' },
          { id: 'ask-birth-chart', name: 'Ask About Birth Chart', description: 'Detailed interpretation of specific sign/house combinations' },
          { id: 'ask-compatibility', name: 'Ask About Compatibility', description: 'Relational chemistry, elemental friction and mutual attraction' },
          { id: 'ask-tarot', name: 'Ask About Tarot', description: 'Meanings of upright and reversed cards in different contexts' },
          { id: 'ask-numerology', name: 'Ask About Numerology', description: 'Decode Life Path, Destiny numbers and angel synchronicities' },
          { id: 'ask-vedic-astrology', name: 'Ask About Vedic Astrology', description: 'Guidance on Kundli houses, Nakshatras and planetary periods' },
          { id: 'ask-spirituality', name: 'Ask About Spirituality', description: 'Practical advice on chakras, crystals, meditation and dreams' }
        ]
      }
    ]
  },

  // 15. 👤 MY ASTRAL
  {
    id: 'my-astral',
    name: 'MY ASTRAL',
    icon: '👤',
    summary: 'Your Personal Cosmic Dashboard, Saved Charts & Consultation Transcripts',
    color: '#e76f51',
    subCategories: [
      {
        id: 'user-portal',
        name: 'Personal Sanctuary Account',
        items: [
          { id: 'dashboard', name: 'Dashboard', description: 'Your personal cosmic home with daily transit scores and active updates' },
          { id: 'my-birth-chart', name: 'My Birth Chart', description: 'Your saved natal wheel and real-time transit overlay' },
          { id: 'my-horoscope', name: 'My Horoscope', description: 'Curated daily and weekly forecast matched to your Big Three' },
          { id: 'my-tarot', name: 'My Tarot', description: 'Personal tarot journal recording daily draws and personal insights' },
          { id: 'my-readings', name: 'My Readings', description: 'Archived consultation transcripts, voice notes and reader advice' },
          { id: 'my-reports', name: 'My Reports', description: 'Downloadable PDF reports for natal charts, yearly and synastry' },
          { id: 'my-compatibility', name: 'My Compatibility', description: 'Stored synastry comparison charts with partners, family and friends' },
          { id: 'saved-articles', name: 'Saved Articles', description: 'Bookmarked masterclasses, guides and planetary transit articles' },
          { id: 'favorite-experts', name: 'Favorite Experts', description: 'Follow your trusted practitioners and get notified when online' },
          { id: 'notifications', name: 'Notifications', description: 'Alerts for key celestial transits, full moons and expert availability' },
          { id: 'subscription', name: 'Subscription', description: 'Manage VIP membership, daily transit alerts and report discounts' },
          { id: 'settings', name: 'Settings', description: 'Personal birth details, time zone, security and communication preferences' }
        ]
      }
    ]
  },

  // 16. 💎 PREMIUM
  {
    id: 'premium',
    name: 'PREMIUM',
    icon: '💎',
    summary: 'Bespoke In-Depth Reports, AI Astrology & VIP Elder Consultations',
    color: '#ffd166',
    subCategories: [
      {
        id: 'premium-offerings',
        name: 'Premium Reports & Consultations',
        items: [
          { id: 'premium-reports', name: 'Premium Reports', description: 'Comprehensive library of personalized astrological deliverables' },
          { id: 'birth-chart-report', name: 'Birth Chart Report', description: '45-page deep psychological and karmic life blueprint book', badge: 'Bestseller' },
          { id: 'yearly-forecast', name: 'Yearly Forecast', description: '12-month cosmic roadmap covering career, wealth and romance' },
          { id: 'compatibility-report', name: 'Compatibility Report', description: 'Synastry and composite analysis of two souls and their contract' },
          { id: 'kundli-report', name: 'Kundli Report', description: 'Vedic Kundli with Mahadasha timeline and customized gemstone remedies' },
          { id: 'premium-tarot-reading', name: 'Tarot Reading', description: 'Comprehensive Celtic Cross recorded consultation by a Tarot Master' },
          { id: 'premium-psychic-reading', name: 'Psychic Reading', description: 'Deep aura reading and clairvoyant energetic assessment' },
          { id: 'ai-astrology', name: 'AI Astrology', description: '24/7 personalized transit insights synthesized from real planetary ephemeris' },
          { id: 'expert-consultation', name: 'Expert Consultation', description: 'Private 1-on-1 direct session with senior spiritual elders' }
        ]
      }
    ]
  },

  // 17. 🌍 GLOBAL
  {
    id: 'global',
    name: 'GLOBAL',
    icon: '🌍',
    summary: '11 Languages, Local Currencies, International Time Zones & Payments',
    color: '#48cae4',
    subCategories: [
      {
        id: 'global-languages',
        name: 'Languages',
        description: 'Sanctuary interface and reading translations',
        items: [
          { id: 'lang-en', name: 'English', description: 'Default international sanctuary language with UK GMT/UTC ephemeris' },
          { id: 'lang-es', name: 'Spanish', description: 'Español • Horóscopo diario, carta natal y lecturas de tarot' },
          { id: 'lang-fr', name: 'French', description: 'Français • Astrologie occidentale, thème astral et tirages' },
          { id: 'lang-de', name: 'German', description: 'Deutsch • Geburtshoroskop, Tierkreiszeichen und Vorhersagen' },
          { id: 'lang-pt', name: 'Portuguese', description: 'Português • Mapa astral, compatibilidade e tarô' },
          { id: 'lang-it', name: 'Italian', description: 'Italiano • Oroscopo quotidiano, tema natale e cartomanzia' },
          { id: 'lang-hi', name: 'Hindi', description: 'हिन्दी • कुण्डली, राशि, नक्षत्र और वैदिक ज्योतिष' },
          { id: 'lang-ar', name: 'Arabic', description: 'العربية • علم الفلك، التوافق، وقراءات التاروت' },
          { id: 'lang-ja', name: 'Japanese', description: '日本語 • 毎日の星占い、出生図、タロット占い' },
          { id: 'lang-ko', name: 'Korean', description: '한국어 • 일일 별자리 운세, 사주 점성술 및 타로' },
          { id: 'lang-id', name: 'Indonesian', description: 'Bahasa Indonesia • Ramalan zodiak harian dan bagan kelahiran' }
        ]
      },
      {
        id: 'global-settings',
        name: 'International Infrastructure',
        items: [
          { id: 'countries-regions', name: 'Countries / Regions', description: 'Localized ephemeris calculations calibrated for Northern and Southern Hemispheres' },
          { id: 'localized-content', name: 'Localized Content', description: 'Cultural astrology traditions (Vedic in South Asia, Western in UK/Europe)' },
          { id: 'local-currency', name: 'Local Currency', description: 'Support for USD ($), GBP (£), EUR (€), CAD (CA$), and AUD (A$)' },
          { id: 'local-time-zones', name: 'Local Time Zones', description: 'Automatic conversion of exact transit ingresses to your local city time' },
          { id: 'international-payments', name: 'International Payments', description: 'Secure Apple Pay, Google Pay, Visa, Mastercard and Express Checkout' }
        ]
      }
    ]
  },

  // 18. ⚙️ COMPANY
  {
    id: 'company',
    name: 'COMPANY',
    icon: '⚙️',
    summary: 'Ethical Sanctuary Charter, Transparency, FAQ & Legal Policies',
    color: '#6c757d',
    subCategories: [
      {
        id: 'company-information',
        name: 'The LUMSIC Sanctuary Framework',
        items: [
          { id: 'about-astral', name: 'About LUMSIC', description: 'Founded in London, UK. Bridging ancient celestial wisdom and modern technology' },
          { id: 'contact', name: 'Contact', description: '24/7 client care team based in the United Kingdom' },
          { id: 'careers', name: 'Careers', description: 'Join our vetted collective of verified spiritual elders' },
          { id: 'press', name: 'Press', description: 'Media coverage, astrological commentary and press releases' },
          { id: 'faq', name: 'FAQ', description: 'Frequently asked questions on billing, privacy, accuracy and free minutes' },
          { id: 'privacy-policy', name: 'Privacy Policy', description: 'GDPR compliant customer birth details and encrypted transcripts' },
          { id: 'terms', name: 'Terms', description: 'Sanctuary guidelines, terms of service and consultation conduct' },
          { id: 'cookie-policy', name: 'Cookie Policy', description: 'Clear control over browsing preferences and analytics' },
          { id: 'disclaimer', name: 'Disclaimer', description: 'Consultations are for guidance and spiritual reflection; not medical or legal advice' },
          { id: 'editorial-policy', name: 'Editorial Policy', description: 'How ephemeris algorithms and transit articles are researched and verified' }
        ]
      }
    ]
  }
];
