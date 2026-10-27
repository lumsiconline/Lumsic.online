/**
 * Detailed 2 to 3 Minute UK Daily Horoscope Audio Transcripts & Structured Guidance
 * Tailored for UK & Global users with London Ephemeris and BST/GMT alignments.
 */

export interface DetailedAudioHoroscope {
  signId: string;
  signName: string;
  element: string;
  rulingPlanet: string;
  symbol: string;
  dates: string;
  londonEphemerisDegree: string;
  headline: string;
  // Core Guidance Blocks
  whatToExpect: string;
  favourableAspects: string[];
  cautionsAndAvoid: string[];
  luckyNumbers: number[];
  luckyColors: string[];
  auspiciousTimeUK: string;
  botanicalAlly: string;
  powerAffirmation: string;
  // Full 2.5 - 3 Minute Audio Script (~380 - 450 words)
  fullAudioScript: string;
}

export const DETAILED_AUDIO_HOROSCOPES: Record<string, DetailedAudioHoroscope> = {
  aries: {
    signId: 'aries',
    signName: 'Aries',
    element: 'Fire',
    rulingPlanet: 'Mars',
    symbol: '♈',
    dates: '21 Mar – 19 Apr',
    londonEphemerisDegree: 'Mars at 14° Leo trine North Node',
    headline: 'Mars Trine Sparks Bold Breakthroughs & Decisive Courage',
    whatToExpect: 'Under today’s dynamic British sky, the cosmic current ignites your natural pioneering spirit. A potent harmonious aspect between Mars and the Moon quickens your mental cadence, sharpening your instincts for leadership. Expect sudden clarity surrounding an ambition or negotiation that had previously felt stagnant.',
    favourableAspects: [
      'Presenting commercial proposals or innovative concepts before 2:00 PM',
      'Resolving lingering domestic friction through transparent, warm dialogue',
      'Physical vitality, cardiovascular stamina, and competitive sports'
    ],
    cautionsAndAvoid: [
      'Avoid reactive outbursts or cutting people off during team meetings',
      'Refrain from speculative purchases during late afternoon transit shifts',
      'Do not rush traffic or commute corridors in haste; practice measured tempo'
    ],
    luckyNumbers: [9, 17, 24],
    luckyColors: ['Crimson Red', 'Sunlit Copper'],
    auspiciousTimeUK: '10:45 AM – 12:15 PM BST',
    botanicalAlly: 'Rosemary & Wild Heather',
    powerAffirmation: 'I channel my fire with deliberate nobility and patient grace.',
    fullAudioScript: `Welcome to your LUMSIC Daily Celestial Audio Ephemeris for Aries, anchored to the London Greenwich Meridian. 

Take a gentle, grounding breath as we tune into today's planetary movements. Your ruling planet, fiery Mars, forms an invigorating trine with the Moon, bringing high vitality and razor-sharp clarity to your morning hours. 

Here is what is unfolding for you today. You will notice a palpable surge in determination. A project, discussion, or commercial initiative that felt stalled over the past fortnight suddenly regains rapid momentum. Colleagues and loved ones are drawn to your authenticity, provided you lead with warmth rather than impatience.

Now, let us examine what is strongly favourable for you today. The hours between ten forty-five in the morning and midday British Summer Time are your peak power window. During this phase, pitching bold ideas, asking for overdue clarity, or signing strategic agreements carries tremendous celestial backing. In personal matters, a candid, open-hearted conversation brings immediate relief and restores trust.

However, be mindful of what you must consciously avoid. With Mars moving at a brisk tempo, there is a tendency to speak before the other person has finished, or to mistake haste for productivity. Avoid snap judgments in financial expenditures during the late afternoon. If someone provokes your boundaries, respond from dignity, not reaction.

Your lucky numbers for today are nine, seventeen, and twenty-four. Your sacred power colours are vibrant Crimson Red and warm Sunlit Copper. Your botanical ally is aromatic Rosemary, known in ancient British folklore for memory, clarity, and protection.

Carry this cosmic affirmation with you today: "I channel my fire with deliberate nobility and patient grace. I am in right timing, and all that belongs to me arrives effortlessly."

Have a blessed, victorious day ahead.`
  },

  taurus: {
    signId: 'taurus',
    signName: 'Taurus',
    element: 'Earth',
    rulingPlanet: 'Venus',
    symbol: '♉',
    dates: '20 Apr – 20 May',
    londonEphemerisDegree: 'Venus at 22° Virgo sextile Jupiter',
    headline: 'Venusian Harmony Cultivates Durability & Financial Serenity',
    whatToExpect: 'The cosmic atmosphere today favours your classic grounded sensibility. Venus casts an amber glow across your solar second house of earned income, security, and tactile contentment. You will feel a comforting rhythm return to your daily obligations, allowing you to build sustainable value.',
    favourableAspects: [
      'Reviewing investments, real estate inquiries, and long-term savings',
      'Enjoying fine dining, home aesthetics, or artisanal herbal craft',
      'Solidifying professional alliances built on trust and demonstrated craft'
    ],
    cautionsAndAvoid: [
      'Avoid stubborn refusal to consider alternative logistical methods',
      'Resist comfort spending on luxury items you do not genuinely need',
      'Do not bottle emotional observations; express them gently over tea'
    ],
    luckyNumbers: [6, 15, 33],
    luckyColors: ['Emerald Green', 'Soft Rose Gold'],
    auspiciousTimeUK: '1:30 PM – 3:15 PM BST',
    botanicalAlly: 'Thyme & English Meadowsweet',
    powerAffirmation: 'I cultivate abundance through patience, integrity, and peace.',
    fullAudioScript: `Welcome to your LUMSIC Daily Celestial Audio Ephemeris for Taurus, broadcast from the London Meridian.

Settle into your physical body and allow the soothing frequencies of the cosmos to wash over you. Today, your sovereign guardian planet Venus enters a magnificent sextile with benevolent Jupiter, granting you serene mental equilibrium and deep intuitive common sense.

Here is what is unfolding for your day. You will experience a calm, steady rhythm that dissolves recent anxieties about material security. Practical solutions will appear for logistical challenges that previously seemed intractable. Trust your eye for quality and balance; your aesthetic discernment is running at an all-time peak today.

Looking at what is exceptionally favourable: the afternoon window between one-thirty and three-fifteen British Summer Time holds exceptional luck for financial assessments, renegotiating contractual terms, or investing in the sanctuary of your home. In love, unhurried presence speaks volumes. A quietly shared meal or thoughtful gesture anchors your relationship in profound warmth.

What should you be cautious about today? Guard against digging your heels in simply for the sake of familiarity. If a colleague proposes a modern digital workflow or an alternative route, listen with an open mind. Furthermore, beware of emotional indulgence or spending on fleeting comforts when what your soul truly craves is rest.

Your auspicious numbers today are six, fifteen, and thirty-three. Your sacred resonance colours are lush Emerald Green and Soft Rose Gold. Your botanical ally is fragrant English Meadowsweet, sacred to earth spirits for calming the nervous system.

Embrace this affirmation for your day: "I cultivate abundance through patience, integrity, and peace. My foundation is unshakeable, and my joy is deep."

Walk in beauty and grounded certainty today.`
  },

  gemini: {
    signId: 'gemini',
    signName: 'Gemini',
    element: 'Air',
    rulingPlanet: 'Mercury',
    symbol: '♊',
    dates: '21 May – 20 Jun',
    londonEphemerisDegree: 'Mercury at 18° Libra conjunct Moon',
    headline: 'Mercury-Moon Conjunction Fuels Eloquence & Social Magnetism',
    whatToExpect: 'An exhilarating celestial breeze sweeps through your sign as Mercury joins forces with the Moon in an air trine. Your quick wit, associative thinking, and persuasive charm are on radiant display. Important messages, unexpected invitations, and fruitful networking arrive in swift succession.',
    favourableAspects: [
      'Broadcasting, public speaking, pitching, and publishing written work',
      'Reconnecting with estranged acquaintances and social circles',
      'Brainstorming multidimensional business solutions and creative ideas'
    ],
    cautionsAndAvoid: [
      'Avoid scattering your attention across ten unfinished tasks simultaneously',
      'Do not pass along unverified gossip or speculative office hearsay',
      'Beware of digital fatigue; remember to unplug your devices after dusk'
    ],
    luckyNumbers: [5, 14, 23],
    luckyColors: ['Canary Yellow', 'Sky Opal Blue'],
    auspiciousTimeUK: '9:00 AM – 10:30 AM BST',
    botanicalAlly: 'Peppermint & Wild Lavender',
    powerAffirmation: 'My words are conduits of truth, healing, and inspirational clarity.',
    fullAudioScript: `Welcome to your LUMSIC Daily Audio Horoscope for Gemini. 

Take a deep breath and center your thoughts as we attune to the celestial sphere. Today, your quicksilver ruler Mercury aligns in radiant conjunction with the Moon, blessing your mind with dazzling lucidity, charm, and intuitive verbal grace.

Here is what is in store for you today. Conversations that have dragged on with ambiguity will suddenly reach crystallised understanding. You possess an uncanny ability to connect seemingly unrelated dots, offering solutions that leave superiors and partners genuinely impressed. Expect serendipitous emails, messages, or phone calls that open a delightful new avenue of curiosity.

Your most favourable cosmic opportunities arrive early. The morning period between nine and ten-thirty British Summer Time is optimal for sending critical correspondences, negotiating agreements, or delivering presentations. On a romantic level, playful banter reignites sparks of attraction.

What must you navigate with caution today? The biggest trap for Gemini today is mental over-stimulation. Because your mind is racing with five brilliant concepts at once, you risk starting everything and completing nothing. Pick your top two priorities and see them through before chasing the next shiny idea. Also, guard against repeating office rumors or confidential remarks in casual conversation.

Your auspicious numbers are five, fourteen, and twenty-three. Your harmonic colours are Canary Yellow and Sky Opal Blue. Your plant companion is revitalising Peppermint, which sharpens focus while cooling mental tension.

Carry this guiding affirmation in your heart: "My words are conduits of truth, healing, and inspirational clarity. I listen with depth and speak with grace."

May your day be filled with sparkling discovery and joyous connection.`
  },

  cancer: {
    signId: 'cancer',
    signName: 'Cancer',
    element: 'Water',
    rulingPlanet: 'Moon',
    symbol: '♋',
    dates: '21 Jun – 22 Jul',
    londonEphemerisDegree: 'Moon at 9° Scorpio trine Neptune',
    headline: 'Luminous Intuition & Emotional Sanctum Bring Renewal',
    whatToExpect: 'The lunar currents flow deep into your intuitive waters today as the Moon forms a mystical trine with Neptune. Your empathic radar is exceptionally heightened. You will intuitively sense what others cannot articulate, allowing you to offer healing and receive profound validation.',
    favourableAspects: [
      'Intuitive readings, spiritual divination, and reflective journaling',
      'Deepening intimacy with trusted kindred spirits and family members',
      'Artistic creation, culinary alchemy, and rejuvenating home rituals'
    ],
    cautionsAndAvoid: [
      'Avoid absorbing the emotional exhaustion or negativity of strangers',
      'Do not retreat into defensive silence when a calm boundary is needed',
      'Resist rumination over historical regrets; anchor your heart in the present'
    ],
    luckyNumbers: [2, 7, 20],
    luckyColors: ['Silver Pearl', 'Moonlit Indigo'],
    auspiciousTimeUK: '6:15 PM – 7:45 PM BST',
    botanicalAlly: 'Chamomile & White Willow Bark',
    powerAffirmation: 'My sensitivity is my divine strength; I am protected, loved, and whole.',
    fullAudioScript: `Welcome to your LUMSIC Daily Audio Ephemeris for Cancer, tuned to the London cosmic grid.

Close your eyes for a moment, place a hand over your heart center, and breathe into the deep, oceanic rhythm of your soul. Your ruling luminary, the Moon, harmonises in a sublime water trine with mystical Neptune today, opening the gates of intuition and emotional renewal.

Here is what you will experience today. A wave of intuitive insight will guide your decisions. Dreams from last night or quiet gut feelings during your morning routine hold genuine guidance regarding a relationship or domestic question. You will find yourself naturally drawn to beautify your personal space and protect your inner peace.

Let us explore what is especially favourable: the evening hours between six-fifteen and seven-forty-five British Summer Time are bathed in gentle golden grace. It is an exquisite time for heartfelt conversations, artistic expression, or consulting the tarot cards. In family and love, vulnerability met with sincerity will dissolve long-held defensiveness.

What cautions should you heed today? Because your psychic sponge is fully open, you risk absorbing the complaints and stress of those around you on public transit or in crowded environments. Visualise a shield of radiant silver light surrounding your aura. Do not take responsibility for fixing problems that do not belong to your karma.

Your lucky numbers today are two, seven, and twenty. Your sacred colours are Silver Pearl and Moonlit Indigo. Your botanical guardian is delicate Chamomile, celebrated across the British Isles for calming the emotional waters and inviting sweet dreams.

Meditate upon this affirmation: "My sensitivity is my divine strength; I am protected, loved, and whole. I honour my emotional tides with grace."

Walk in profound tranquility and inner wisdom today.`
  },

  leo: {
    signId: 'leo',
    signName: 'Leo',
    element: 'Fire',
    rulingPlanet: 'Sun',
    symbol: '♌',
    dates: '23 Jul – 22 Aug',
    londonEphemerisDegree: 'Sun at 11° Libra sextile Mars',
    headline: 'Solar Magnificence Radiates Creative Authority & Goodwill',
    whatToExpect: 'Your celestial ruler the Sun shines with regal brilliance as it aligns with invigorating Mars. You command natural respect today without needing to raise your voice. Others look to your warmth, optimism, and executive flair to set the tone for collaborative triumphs.',
    favourableAspects: [
      'Taking command of key presentations, leadership summits, or creative showcases',
      'Reigniting romantic passion and generous grand gestures of appreciation',
      'Health breakthroughs, stamina training, and vitality restoration'
    ],
    cautionsAndAvoid: [
      'Avoid taking constructive critiques as a personal assault on your pride',
      'Do not over-promise on timelines merely to impress an audience',
      'Guard against exhausting your energy reserves; schedule intentional quiet'
    ],
    luckyNumbers: [1, 10, 19],
    luckyColors: ['Imperial Gold', 'Warm Amber'],
    auspiciousTimeUK: '11:15 AM – 1:00 PM BST',
    botanicalAlly: 'St. John’s Wort & Sunflower Seed',
    powerAffirmation: 'I shine my light with generosity, humility, and majestic truth.',
    fullAudioScript: `Welcome to your LUMSIC Daily Audio Ephemeris for Leo, broadcast from the heart of the London Meridian.

Lift your chin, draw back your shoulders, and embrace the magnificent warmth of your solar essence. Today, your governing star, the Sun, locks into an exquisite supportive sextile with energetic Mars, elevating your personal magnetism and creative authority to towering heights.

Here is what is in store for you today. You will find people turning to you for leadership and clarity. If an impasse has clouded a workplace initiative or family gathering, your innate gift for seeing the larger, noble vision will restore morale. Your creative enthusiasm is contagious, making this an unforgettable day to make an impression.

What is profoundly favourable for you today? Your peak solar window occurs between eleven-fifteen in the morning and one in the afternoon British Summer Time. Schedule your most crucial meetings, pitches, or performances during this interval. In the realm of love, your generous nature shines; planning a romantic surprise or expressing genuine admiration will be received with open arms.

What should you consciously avoid today? Beware the shadow of the lion’s pride. If someone offers feedback on details or suggests a minor course correction, do not perceive it as an attack on your competence. Listen carefully to the quieter voices in the room. Furthermore, do not burn the candle at both ends; your body needs restorative recharge tonight.

Your auspicious numbers are one, ten, and nineteen. Your sacred radiance colours are Imperial Gold and Warm Amber. Your herbal ally is St. John's Wort, revered for centuries in Britain for lifting melancholia and anchoring solar joy in the spirit.

Let this affirmation accompany your strides: "I shine my light with generosity, humility, and majestic truth. I am a magnet for benevolent opportunities."

Radiate with noble splendour today.`
  },

  virgo: {
    signId: 'virgo',
    signName: 'Virgo',
    element: 'Earth',
    rulingPlanet: 'Mercury',
    symbol: '♍',
    dates: '23 Aug – 22 Sep',
    londonEphemerisDegree: 'Mercury at 18° Libra sextile Saturn',
    headline: 'Mastery of Method & Discernment Yield Durable Triumph',
    whatToExpect: 'With Mercury in an auspicious angle to structuring Saturn, the cosmic architect smiles upon your analytical genius today. You have an unparalleled knack for diagnosing inefficiencies, perfecting intricate plans, and bringing serene order out of chaotic circumstance.',
    favourableAspects: [
      'Auditing legal documents, budgets, blueprints, and analytical research',
      'Implementing wellness routines, dietary purification, and physical therapy',
      'Mentoring others with practical wisdom and unshakeable common sense'
    ],
    cautionsAndAvoid: [
      'Avoid hyper-fixating on trivial flaws that do not impact the overall outcome',
      'Refrain from self-critical internal monologues; grant yourself grace',
      'Do not take on extra labor solely because others failed to do their part'
    ],
    luckyNumbers: [4, 8, 22],
    luckyColors: ['Navy Slate', 'Forest Sage'],
    auspiciousTimeUK: '8:30 AM – 10:00 AM BST',
    botanicalAlly: 'Fennel Seed & English Oak Moss',
    powerAffirmation: 'I trust my discernment and celebrate both progress and imperfection.',
    fullAudioScript: `Welcome to your LUMSIC Daily Audio Ephemeris for Virgo.

Take a steady, calming breath, releasing any tension stored in your shoulders or neck. Today, your intellectual patron Mercury aligns in an extraordinary stabilizing aspect with Saturn, providing you with laser-sharp focus, architectural foresight, and profound grounding.

Here is what today brings for you. You will easily spot the subtle errors or overlooked opportunities that others missed. It is a day of quiet, methodical victories. Whether in your professional sphere or personal administration, tidying up unresolved matters will bring an immense wave of psychological satisfaction.

Your most favourable cosmic window opens early, between eight-thirty and ten o’clock in the morning British Summer Time. This is the ideal hour to draft complex agreements, review accounts, organise logistics, or begin a health purification protocol. In relationships, acts of practical service will be deeply cherished by your partner.

What must you actively avoid today? Beware the trap of perfectionism. Remember that perfection is an illusion; do not delay submitting good work because you are obsessing over a microscopic aesthetic detail. Also, resist the urge to silently clean up after colleagues who should be carrying their own weight. Set clear boundaries with polite firmness.

Your auspicious numbers are four, eight, and twenty-two. Your harmonic resonance colours are Navy Slate and Forest Sage. Your botanical companion is Fennel, celebrated in herbal traditions for soothing digestion and clearing mental cobwebs.

Anchor yourself in this truth today: "I trust my discernment and celebrate both progress and imperfection. I am efficient, valued, and fundamentally at peace."

May your day be productive, lucid, and serene.`
  },

  libra: {
    signId: 'libra',
    signName: 'Libra',
    element: 'Air',
    rulingPlanet: 'Venus',
    symbol: '♎',
    dates: '23 Sep – 22 Oct',
    londonEphemerisDegree: 'Sun and Mercury in Libra conjunct Venus',
    headline: 'Supreme Grace, Diplomatic Magnetism & Relational Magic',
    whatToExpect: 'Your sign is bathed in golden celestial favor as the Sun, Mercury, and Venus harmonize in your realm of equilibrium. Your aesthetic taste, social tact, and natural charm make you the undisputed diplomat of the zodiac today. Bridges that were burned can now be rebuilt with ease.',
    favourableAspects: [
      'Mediating disputes, closing partnership contracts, and legal arbitration',
      'Art curation, wardrobe redesign, and aesthetic spatial refinement',
      'Romantic declarations, celebratory gatherings, and intimate rendezvous'
    ],
    cautionsAndAvoid: [
      'Avoid chronic indecision driven by the desire to please everyone',
      'Do not say yes to a commitment when your genuine answer is no',
      'Beware of superficial flatterers who lack substantiated loyalty'
    ],
    luckyNumbers: [3, 11, 27],
    luckyColors: ['Cornflower Blue', 'Blush Champagne'],
    auspiciousTimeUK: '2:15 PM – 4:00 PM BST',
    botanicalAlly: 'Rose Petal & Elderflower',
    powerAffirmation: 'I stand centered in my truth, radiating peace, justice, and beauty.',
    fullAudioScript: `Welcome to your LUMSIC Daily Celestial Audio Ephemeris for Libra, tuned directly to the London Meridian.

Take a gentle, balanced breath, feeling the poise and harmony at the center of your heart. Today, the cosmos bestows upon you a remarkable mantle of grace. The Sun and communicative Mercury dance alongside your ruling planet Venus, turning you into a magnetic beacon of harmony, beauty, and refined diplomacy.

Here is what is unfolding for your day. Hostility melts in your presence. In meetings, social settings, or family discussions, your ability to articulate fair compromises will save the day. You will also feel an irresistible urge to surround yourself with art, music, and uplifting companionship.

Looking at your most favourable opportunities: the golden afternoon window between two-fifteen and four o'clock British Summer Time is primed for romantic reconciliations, concluding lucrative business partnerships, or revamping your personal aesthetic. In romance, love flows effortlessly; speak from your authentic heart.

What should you cautiously avoid today? The biggest pitfall for Libra is people-pleasing at the expense of your own needs. If you disagree with a proposal, do not nod politely just to prevent temporary awkwardness. Stand firmly in your discernment. Furthermore, don't allow yourself to get paralyzed choosing between two equally pleasant dinner or leisure options—trust your immediate instinct.

Your lucky numbers today are three, eleven, and twenty-seven. Your sacred colours are Cornflower Blue and Blush Champagne. Your plant ally is Elderflower, sacred across the British countryside for beauty, protection, and sweet blessings.

Carry this affirmation with you: "I stand centered in my truth, radiating peace, justice, and beauty. I choose what honors my soul."

Have a gracious and beautifully aligned day.`
  },

  scorpio: {
    signId: 'scorpio',
    signName: 'Scorpio',
    element: 'Water',
    rulingPlanet: 'Pluto & Mars',
    symbol: '♏',
    dates: '23 Oct – 21 Nov',
    londonEphemerisDegree: 'Moon in Scorpio trine Saturn in Pisces',
    headline: 'Penetrating Intuition & Alchemical Inner Power Unleashed',
    whatToExpect: 'With the Moon navigating your sovereign waters in a profound trine to Saturn in Pisces, an unshakeable inner resilience awakens. You can pierce through superficial pretenses and perceive the hidden psychological currents beneath any situation with total precision.',
    favourableAspects: [
      'Deep research, investigative strategy, and occult or psychological studies',
      'Eliminating toxic habits, emotional clutter, and outdated financial debts',
      'Passionate, transformative bonds that demand absolute truth and loyalty'
    ],
    cautionsAndAvoid: [
      'Avoid harboring vindictive grudges or plotting silent retaliations',
      'Do not let suspicious assumptions override verifiable factual evidence',
      'Resist isolating yourself behind emotional battlements out of fear'
    ],
    luckyNumbers: [8, 13, 29],
    luckyColors: ['Deep Obsidian', 'Royal Crimson'],
    auspiciousTimeUK: '7:00 PM – 8:45 PM BST',
    botanicalAlly: 'Pomegranate Bark & Hawthorn Berry',
    powerAffirmation: 'I release what no longer serves me and step into my sovereign power.',
    fullAudioScript: `Welcome to your LUMSIC Daily Audio Horoscope for Scorpio.

Take a slow, deep breath, dropping down into the profound stillness at the core of your being. Today, the Moon transits your home waters of Scorpio, forming a solemn, alchemical trine with Saturn. This grants you immense psychological endurance, psychic precision, and unshakable quiet power.

Here is what you will experience today. Your intuition operates like an X-ray machine. You will see straight through facades, marketing spin, or false assurances. If a mystery or financial question has confounded you, the answer reveals itself with startling clarity. It is a day of profound inner alchemy, where past pain transmutes into unyielding strength.

What is exceptionally favourable for you? The evening hours between seven and eight-forty-five British Summer Time are sacred for focused research, financial restructuring, or experiencing deep emotional intimacy with a trusted confidant. It is also an extraordinary window for divination, meditation, or clearing your energy field.

What should you strictly avoid today? Guard against nursing old wounds or assuming betrayal where there was merely clumsy human carelessness. Do not use your sharp psychological insight as a weapon to dismantle someone whose insecurities are already evident. Choose mercy over vengeance, and let the universe handle the justice.

Your auspicious numbers today are eight, thirteen, and twenty-nine. Your sacred power colours are Deep Obsidian and Royal Crimson. Your botanical guardian is Hawthorn Berry, celebrated in ancient Celtic lore as the protector of the heart and the weaver of emotional courage.

Let this affirmation fortify your spirit: "I release what no longer serves me and step into my sovereign power. I transform all darkness into luminous wisdom."

Walk in invulnerable strength and depth today.`
  },

  sagittarius: {
    signId: 'sagittarius',
    signName: 'Sagittarius',
    element: 'Fire',
    rulingPlanet: 'Jupiter',
    symbol: '♐',
    dates: '22 Nov – 21 Dec',
    londonEphemerisDegree: 'Jupiter at 20° Gemini sextile Sun',
    headline: 'Expanding Horizons, Philosophical Epiphanies & Joyful Fortune',
    whatToExpect: 'A buoyant current of optimism fills your sails as your ruling guide Jupiter forms a glorious sextile with the Sun. Your thirst for knowledge, adventure, and spiritual exploration is met with open doors. International affairs, educational breakthroughs, and synchronistic encounters abound.',
    favourableAspects: [
      'Booking journeys, applying for academic courses, and launching foreign ventures',
      'Philosophical discussions, publishing, and mentoring enthusiastic seekers',
      'Embracing spontaneous social adventures that expand your worldview'
    ],
    cautionsAndAvoid: [
      'Avoid gambling or reckless financial gambits based purely on hype',
      'Do not make grand promises you cannot realistically fulfill next week',
      'Beware of dogmatism; ensure your enthusiasm leaves room for other viewpoints'
    ],
    luckyNumbers: [7, 12, 30],
    luckyColors: ['Royal Purple', 'Burnt Terracotta'],
    auspiciousTimeUK: '12:30 PM – 2:00 PM BST',
    botanicalAlly: 'Sage & Cedarwood',
    powerAffirmation: 'I shoot my arrow of intent with faith, wisdom, and expansive joy.',
    fullAudioScript: `Welcome to your LUMSIC Daily Celestial Audio Ephemeris for Sagittarius, broadcast from London.

Take a magnificent, expansive breath and feel your spirit soar into the vast open skies of possibility. Today, your cosmic patron Jupiter forms a dazzling sextile with the radiant Sun, infusing your bloodstream with optimism, good fortune, and visionary inspiration.

Here is what is unfolding for your day. A feeling of heavy stagnation lifts effortlessly. You will see the broader horizon that gives meaning to recent struggles. Encounters today will carry a distinct flavor of serendipity—a passing remark, a book recommendation, or a message from abroad will spark an exhilarating new vision for your future.

What is exceptionally favourable today? The midday phase between twelve-thirty and two o'clock British Summer Time is your most auspicious window. Use this time to book travel, submit ambitious proposals, purchase tickets, or initiate study in esoteric and academic fields. In relationships, sharing dreams and philosophical laughs reignites deep mutual passion.

What must you navigate with prudence today? The only danger for the archer under this sky is over-promising. In your generous excitement, you might agree to deadlines, financial sponsorships, or social invitations that your calendar cannot realistically sustain. Practice checking your ledger before you say yes. Also, ensure your honest bluntness is tempered with kindness.

Your lucky numbers today are seven, twelve, and thirty. Your sacred colours are Royal Purple and Burnt Terracotta. Your botanical ally is sacred White Sage, revered for clearing spiritual corridors and invoking divine clarity.

Carry this affirmation into the world: "I shoot my arrow of intent with faith, wisdom, and expansive joy. The universe supports my highest expansion."

May your day be filled with radiant adventure and boundless joy.`
  },

  capricorn: {
    signId: 'capricorn',
    signName: 'Capricorn',
    element: 'Earth',
    rulingPlanet: 'Saturn',
    symbol: '♑',
    dates: '22 Dec – 19 Jan',
    londonEphemerisDegree: 'Saturn at 15° Pisces sextile Uranus',
    headline: 'Unshakeable Architecture & Long-Range Victory Materialize',
    whatToExpect: 'The cosmic architect smiles upon your persistent labor today as Saturn forms a supportive sextile with revolutionary Uranus. This unique convergence allows you to synthesize traditional discipline with breakthrough innovation. Your reputation for reliability opens doors in high places.',
    favourableAspects: [
      'Meeting with elders, executives, civic officials, or mentors',
      'Restructuring operational systems, debt obligations, or physical infrastructure',
      'Investing in durable assets, historical craftsmanship, and legacy projects'
    ],
    cautionsAndAvoid: [
      'Avoid emotional austerity or treating loved ones like subordinates',
      'Do not dismiss unconventional ideas simply because they lack precedent',
      'Refrain from skipping meals and hydration while deeply absorbed in work'
    ],
    luckyNumbers: [8, 10, 26],
    luckyColors: ['Charcoal Black', 'Pewter Silver'],
    auspiciousTimeUK: '9:30 AM – 11:15 AM BST',
    botanicalAlly: 'Comfrey & English Pine',
    powerAffirmation: 'I build my legacy step by step with quiet mastery, patience, and honor.',
    fullAudioScript: `Welcome to your LUMSIC Daily Audio Ephemeris for Capricorn.

Stand tall, plant your feet firmly upon the earth, and feel the ancient strength of mountains coursing through your spine. Today, your stoic sovereign Saturn forms an ingenious sextile with visionary Uranus, merging traditional mastery with progressive brilliance.

Here is what is manifesting for you today. You will receive tangible recognition for efforts you made months ago in silence. While others panic over changing market trends or organizational shifts, you will instinctively chart a steady, profitable course. Trust your long-range vision; the marathon is yours to win.

Let us review your peak favourable opportunities: the morning hours between nine-thirty and eleven-fifteen British Summer Time hold extraordinary potential for executive decisions, presenting long-range budgets, or seeking counsel from respected authorities. In personal life, offering steady, practical reassurance to a worried companion cements an unbreakable bond of loyalty.

What should you be watchful about today? Beware of becoming so focused on duty that you turn cold or impatient with those who process things at an emotional rather than logical pace. Do not neglect your physical vessel; step away from the desk to nourish yourself properly. Also, remain open to modern tech solutions rather than clinging strictly to paper.

Your auspicious numbers are eight, ten, and twenty-six. Your sacred colours are Charcoal Black and Pewter Silver. Your herbal ally is English Pine, revered for endurance, clear respiratory fortitude, and unwavering winter life.

Let this affirmation guide your day: "I build my legacy step by step with quiet mastery, patience, and honor. My efforts bear magnificent, lasting fruit."

Walk in dignity and quiet triumph today.`
  },

  aquarius: {
    signId: 'aquarius',
    signName: 'Aquarius',
    element: 'Air',
    rulingPlanet: 'Uranus & Saturn',
    symbol: '♒',
    dates: '20 Jan – 18 Feb',
    londonEphemerisDegree: 'Uranus at 27° Taurus trine Mercury in Libra',
    headline: 'Lightning Inspiration, Humanitarian Insight & Community Resonance',
    whatToExpect: 'An electric charge pulses through the atmosphere as your eccentric ruler Uranus connects in an inventive trine with Mercury. Breakthrough ideas on technology, community organizing, and unconventional creative ventures will strike like lightning. You are three steps ahead of the mainstream curve.',
    favourableAspects: [
      'Collaborating with decentralized networks, charities, or avant-garde groups',
      'Upgrading digital toolsets, coding, writing, or algorithmic inventions',
      'Breaking free from stagnant emotional habits and outdated social dogmas'
    ],
    cautionsAndAvoid: [
      'Avoid being contrarian merely for the sake of provoking convention',
      'Do not detach emotionally when friends require heartfelt empathy',
      'Guard against sudden impulses to abandon stable foundations prematurely'
    ],
    luckyNumbers: [11, 22, 31],
    luckyColors: ['Electric Cyan', 'Midnight Cobalt'],
    auspiciousTimeUK: '3:30 PM – 5:15 PM BST',
    botanicalAlly: 'Eucalyptus & Vervain',
    powerAffirmation: 'I am an open channel for future wisdom, freedom, and universal love.',
    fullAudioScript: `Welcome to your LUMSIC Daily Audio Ephemeris for Aquarius, broadcast from the London Greenwich Meridian.

Take a fresh, invigorating breath of air and open your mind to the frequencies of the quantum cosmos. Today, your avant-garde ruling planet Uranus forms a dazzling inventive trine with communicative Mercury, unlocking sudden downloads of brilliant originality.

Here is what today holds for you. A challenge that has baffled others will yield effortlessly to your unorthodox thinking. You will see the blueprint of the future before anyone else in the room. New friendships, invitations into cutting-edge circles, and sudden creative breakthroughs are highlighted.

Your most favourable cosmic hours arrive in the afternoon between three-thirty and five-fifteen British Summer Time. This is the optimal window to launch digital initiatives, brainstorm radical solutions, or connect with community networks. In matters of the heart, celebrating mutual freedom and intellectual camaraderie brings deep electric joy.

What cautions should you observe today? With so much lightning running through your nervous system, you can easily become overly blunt or intellectually detached. Remember that other humans have tender hearts that need warmth, not cold logic. Also, avoid shocking people simply to enjoy their reaction; channel your eccentricity into productive innovation.

Your auspicious numbers are eleven, twenty-two, and thirty-one. Your sacred colours are Electric Cyan and Midnight Cobalt. Your botanical guardian is ancient Vervain, known to the Druids as the enchanter's plant for opening psychic awareness and calming electrical over-excitation.

Meditate upon this affirmation: "I am an open channel for future wisdom, freedom, and universal love. I walk fearlessly into tomorrow."

Illuminate the world with your unique brilliance today.`
  },

  pisces: {
    signId: 'pisces',
    signName: 'Pisces',
    element: 'Water',
    rulingPlanet: 'Neptune & Jupiter',
    symbol: '♓',
    dates: '19 Feb – 20 Mar',
    londonEphemerisDegree: 'Neptune at 28° Pisces trine Moon in Scorpio',
    headline: 'Mystical Awakening, Artistic Transcendence & Spiritual Grace',
    whatToExpect: 'The cosmic ocean is stirred with divine poetry today as your sovereign ruler Neptune forms a sublime water trine with the Moon. Your intuitive, psychic, and artistic faculties are operating in total resonance with the unseen realms. Miracles of synchronicity and emotional healing are within reach.',
    favourableAspects: [
      'Meditation, sound baths, dream interpretation, and musical composition',
      'Forgiving longstanding grievances and releasing spiritual burdens',
      'Empathic healing work, charitable giving, and oceanic sanctuary retreat'
    ],
    cautionsAndAvoid: [
      'Avoid escapism through substance excess, binge viewing, or daydreaming away responsibilities',
      'Do not allow unscrupulous individuals to exploit your boundless compassion',
      'Beware of vague contractual commitments; insist upon clear written terms'
    ],
    luckyNumbers: [3, 7, 18],
    luckyColors: ['Seafoam Aqua', 'Iridescent Violet'],
    auspiciousTimeUK: '4:45 PM – 6:30 PM BST',
    botanicalAlly: 'Lotus Blossom & Mugwort',
    powerAffirmation: 'I am one with the infinite cosmic tide; divine grace flows through me.',
    fullAudioScript: `Welcome to your LUMSIC Daily Celestial Audio Ephemeris for Pisces, broadcast from the London Meridian.

Close your eyes, breathe gently into your heart space, and listen to the gentle whisper of the cosmic ocean. Today, your mystical patron Neptune aligns in a rare, sublime water trine with the Scorpio Moon, bathing your reality in celestial light, artistic transcendence, and spiritual magic.

Here is what is in store for you today. The veil between the seen and unseen is whisper-thin. Synchronicities will astound you—thinking of an old friend right before their name appears on your screen, or stumbling upon the exact words of reassurance your soul needed. Your creative, musical, and empathic gifts are overflowing.

Your most favourable cosmic portal opens in the late afternoon, between four-forty-five and six-thirty British Summer Time. This is a blessed hour for meditation, tarot divination, artistic creation, or an intimate spiritual walk near water. In love, unconditional acceptance melts years of accumulated misunderstanding.

What must you navigate with discernment today? Because your boundaries are so porous, you must guard against energetic vampires—people who want to dump their emotional chaos onto your gentle spirit. Learn to say "I love you, but I cannot carry this for you." Furthermore, ensure that when dealing with money or contracts, you read every single line without floating away into abstraction.

Your lucky numbers today are three, seven, and eighteen. Your sacred iridescent colours are Seafoam Aqua and Iridescent Violet. Your botanical ally is Mugwort, celebrated in British folk medicine for vivid, prophetic dreams and spiritual boundary protection.

Anchor your soul in this divine affirmation: "I am one with the infinite cosmic tide; divine grace flows through me. I am safe, guided, and deeply loved."

May your day be blessed with pure wonder and divine tranquility.`
  }
};
