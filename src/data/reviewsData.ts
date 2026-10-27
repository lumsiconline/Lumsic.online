export interface VerifiedReview {
  id: string;
  name: string;
  location?: string;
  avatar: string;
  rating: number; // 4.98 or 5
  date: string;
  topic?: string;
  text: string;
}

export const VERIFIED_REVIEWS_POOL: VerifiedReview[] = [
  {
    id: 'rev-1',
    name: 'Elena K.',
    location: 'Chicago, IL',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 hours ago',
    topic: 'Love & Reconciliation',
    text: 'Remarkable accuracy and soothing clarity regarding my love crossroads. Felt heard, understood and deeply grounded.'
  },
  {
    id: 'rev-2',
    name: 'Marcus V.',
    location: 'Austin, TX',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: 'Yesterday',
    topic: 'Career Transition',
    text: 'Pinpointed exact career milestones and timing with unmatched wisdom. Gave me courage to accept the leadership role.'
  },
  {
    id: 'rev-3',
    name: 'Sophia L.',
    location: 'London, UK',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 days ago',
    topic: 'Soulmate Connection',
    text: 'Unbelievable intuition! Her guidance helped restore peace and communication in our relationship. We are back together!'
  },
  {
    id: 'rev-4',
    name: 'David R.',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 days ago',
    topic: 'Life Purpose',
    text: 'Accurate timeline predictions and genuinely caring energy. Picked up on family situations without me saying a word.'
  },
  {
    id: 'rev-5',
    name: 'Aria Montgomery',
    location: 'Toronto, Canada',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '4 days ago',
    topic: 'Twin Flame Journey',
    text: 'Told me things about my past connection nobody else could have known. Her calming voice removed months of anxiety.'
  },
  {
    id: 'rev-6',
    name: 'Liam Patterson',
    location: 'Dublin, Ireland',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '5 days ago',
    topic: 'Business Partnership',
    text: 'Advised me on contracts and timing. The exact negotiation scenario unfolded two weeks later just as predicted.'
  },
  {
    id: 'rev-7',
    name: 'Chloe Dupont',
    location: 'Paris, France',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '6 days ago',
    topic: 'Romantic Clarity',
    text: 'She brought so much warmth to my heavy heart. I felt an immediate shift in my aura and gained peace of mind.'
  },
  {
    id: 'rev-8',
    name: 'Ethan Brooks',
    location: 'Miami, FL',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 week ago',
    topic: 'Financial Growth',
    text: 'Extremely detailed and actionable reading. Gave me precise dates to launch my new venture and it paid off.'
  },
  {
    id: 'rev-9',
    name: 'Isabella Rossi',
    location: 'Rome, Italy',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 week ago',
    topic: 'Karma & Past Lives',
    text: 'Her reading touched deep generational patterns. I finally understood why certain relationship dynamics kept looping.'
  },
  {
    id: 'rev-10',
    name: 'Noah Campbell',
    location: 'Vancouver, Canada',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '8 days ago',
    topic: 'Job Offer Decision',
    text: 'Helped me choose between two competing opportunities with total confidence. Spot on insights.'
  },
  {
    id: 'rev-11',
    name: 'Hannah Schmidt',
    location: 'Berlin, Germany',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '9 days ago',
    topic: 'Heartbreak Healing',
    text: 'I was in tears when the session started and smiling with genuine hope by the end. An angel in human form.'
  },
  {
    id: 'rev-12',
    name: 'Lucas Silva',
    location: 'São Paulo, Brazil',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '10 days ago',
    topic: 'Relocation & Home',
    text: 'Predicted a move across states and described the neighborhood layout before I even applied for the lease.'
  },
  {
    id: 'rev-13',
    name: 'Mia Jenkins',
    location: 'Sydney, Australia',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '11 days ago',
    topic: 'Soul Connection',
    text: 'Tuned into my partner’s unspoken thoughts and explained the silent barrier between us. Communication reopened that night!'
  },
  {
    id: 'rev-14',
    name: 'Oliver Wright',
    location: 'Manchester, UK',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '12 days ago',
    topic: 'Life Roadmap',
    text: 'Not your typical generic tarot reader. Real, pinpoint astrology calculations backed by sharp psychic instinct.'
  },
  {
    id: 'rev-15',
    name: 'Grace Thorne',
    location: 'Denver, CO',
    avatar: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '13 days ago',
    topic: 'Self Worth & Love',
    text: 'Her compassion resonated through every message. Felt like having a trusted elder spiritual sister guide me.'
  },
  {
    id: 'rev-16',
    name: 'Benjamin Cole',
    location: 'Boston, MA',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 weeks ago',
    topic: 'Career Direction',
    text: 'Unbelievably precise. Called out the exact company division and team dynamics that were blocking my promotion.'
  },
  {
    id: 'rev-17',
    name: 'Zoe Martinez',
    location: 'San Diego, CA',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 weeks ago',
    topic: 'Marriage Questions',
    text: 'Provided honest, non-judgmental guidance. Everything she mentioned about his emotional readiness proved true.'
  },
  {
    id: 'rev-18',
    name: 'Alexander Ward',
    location: 'Melbourne, Australia',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 weeks ago',
    topic: 'Spiritual Awakening',
    text: 'Validations that gave me chills. She explained synchronicities I had been experiencing for months.'
  },
  {
    id: 'rev-19',
    name: 'Harper Evans',
    location: 'Atlanta, GA',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 weeks ago',
    topic: 'Second Chances',
    text: 'Told me my ex would reach out near the full moon. Exactly 4 days later a long text arrived apologising!'
  },
  {
    id: 'rev-20',
    name: 'Daniel Kim',
    location: 'San Jose, CA',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 weeks ago',
    topic: 'Startup Funding',
    text: 'Accurately forecast investor interest and warned me about fine print in a clause that turned out to be critical.'
  },
  {
    id: 'rev-21',
    name: 'Emily Watson',
    location: 'Edinburgh, Scotland',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 weeks ago',
    topic: 'Breakup Recovery',
    text: 'Lifted the fog of confusion immediately. I finally felt free to choose myself again.'
  },
  {
    id: 'rev-22',
    name: 'Samuel Green',
    location: 'Portland, OR',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 weeks ago',
    topic: 'Life Timing',
    text: 'Straightforward, respectful, and so reassuring. Left the chat with a clear list of next steps.'
  },
  {
    id: 'rev-23',
    name: 'Lily Bennett',
    location: 'Philadelphia, PA',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 weeks ago',
    topic: 'New Relationship',
    text: 'Described my current partner’s personality to a T without seeing a photo. Deeply impressed.'
  },
  {
    id: 'rev-24',
    name: 'Jackson Reed',
    location: 'Dallas, TX',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 weeks ago',
    topic: 'Career Crossroads',
    text: 'Every minute was rich with insight. No sugar-coating, just genuine spiritual truth.'
  },
  {
    id: 'rev-25',
    name: 'Ava Sinclair',
    location: 'London, UK',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 weeks ago',
    topic: 'Soul Healing',
    text: 'Genuinely the best psychic consultation on this platform. I felt an immediate energy alignment.'
  },
  {
    id: 'rev-26',
    name: 'Matthew Cooper',
    location: 'Chicago, IL',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '4 weeks ago',
    topic: 'Business Expansion',
    text: 'Spot on about the international client. Closed the deal within the exact timeframe she mentioned.'
  },
  {
    id: 'rev-27',
    name: 'Charlotte Davies',
    location: 'Bristol, UK',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '4 weeks ago',
    topic: 'Family Dynamics',
    text: 'Her insights helped mend a longstanding rift with my sister. Can not thank her enough.'
  },
  {
    id: 'rev-28',
    name: 'Henry Foster',
    location: 'Minneapolis, MN',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 month ago',
    topic: 'Investment Decision',
    text: 'Helped me stay patient when my instinct was to rush. Saved me from a massive mistake.'
  },
  {
    id: 'rev-29',
    name: 'Victoria Hughes',
    location: 'Scottsdale, AZ',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 month ago',
    topic: 'Soulmate Signals',
    text: 'Described exact locations where I would meet someone special. Happened 3 weeks later!'
  },
  {
    id: 'rev-30',
    name: 'James Reynolds',
    location: 'London, UK',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 month ago',
    topic: 'Career Elevation',
    text: 'Her advice on approaching my director worked wonders. Promoted with 25% raise.'
  },
  {
    id: 'rev-31',
    name: 'Amelia Clark',
    location: 'Seattle, WA',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 month ago',
    topic: 'Reconnection',
    text: 'I was skeptical at first, but everything unfolded naturally according to her cards.'
  },
  {
    id: 'rev-32',
    name: 'Sebastian Turner',
    location: 'Toronto, Canada',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 month ago',
    topic: 'Clarity & Peace',
    text: 'Extremely calm and grounded reader. Never pushes fear or panic, always empowers.'
  },
  {
    id: 'rev-33',
    name: 'Penelope Scott',
    location: 'Nashville, TN',
    avatar: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 month ago',
    topic: 'Love Rekindling',
    text: 'Helped us understand each other’s astrological love languages. Truly transformative.'
  },
  {
    id: 'rev-34',
    name: 'William Bailey',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 month ago',
    topic: 'Venture Timing',
    text: 'Accurate down to the weeks and energetic climates. A true master of the craft.'
  },
  {
    id: 'rev-35',
    name: 'Layla Morris',
    location: 'Orlando, FL',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 month ago',
    topic: 'Heart Clarity',
    text: 'Her reading brought tears of relief. I finally know where I stand and what to expect.'
  },
  {
    id: 'rev-36',
    name: 'Elijah Morgan',
    location: 'Calgary, Canada',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 month ago',
    topic: 'Life Shift',
    text: 'Clear, concise, and deeply resonant. Every prediction came together cleanly.'
  },
  {
    id: 'rev-37',
    name: 'Nora Bell',
    location: 'Leeds, UK',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 month ago',
    topic: 'Karmic Ties',
    text: 'Untangled complex emotional ties with gentle clarity. I sleep peacefully now.'
  },
  {
    id: 'rev-38',
    name: 'Gabriel Diaz',
    location: 'Houston, TX',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '1 month ago',
    topic: 'Workplace Direction',
    text: 'Gave me confidence to stand my ground. Results were even better than anticipated.'
  },
  {
    id: 'rev-39',
    name: 'Hazel Murphy',
    location: 'Dublin, Ireland',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 months ago',
    topic: 'Twin Flame Sync',
    text: 'Connected directly with my soul vibration. Her words echoed in my mind for weeks.'
  },
  {
    id: 'rev-40',
    name: 'Carter Russell',
    location: 'Salt Lake City, UT',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 months ago',
    topic: 'Major Move',
    text: 'Predicted a relocation and described the view from the window. I am literally living it now!'
  },
  {
    id: 'rev-41',
    name: 'Aubrey Collins',
    location: 'Charlotte, NC',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 months ago',
    topic: 'Love Forecast',
    text: 'Honest reading with no false promises. The exact timeline played out cleanly.'
  },
  {
    id: 'rev-42',
    name: 'Mason Stewart',
    location: 'Glasgow, UK',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 months ago',
    topic: 'Career Pivot',
    text: 'Advised me to apply in renewable tech. Accepted an offer with stellar perks.'
  },
  {
    id: 'rev-43',
    name: 'Stella Sanchez',
    location: 'San Antonio, TX',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 months ago',
    topic: 'Deep Healing',
    text: 'A profound session that brought closure to a 3-year chapter of emotional grief.'
  },
  {
    id: 'rev-44',
    name: 'Luke Rivera',
    location: 'Phoenix, AZ',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 months ago',
    topic: 'Finances & Debt',
    text: 'Practical wisdom alongside mystical insight. Highly recommend to everyone.'
  },
  {
    id: 'rev-45',
    name: 'Maya Cooper',
    location: 'London, UK',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 months ago',
    topic: 'Soul Bond',
    text: 'She read into my thoughts effortlessly. Left the session feeling validated and light.'
  },
  {
    id: 'rev-46',
    name: 'Isaac Howard',
    location: 'Manchester, UK',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 months ago',
    topic: 'Life Strategy',
    text: 'The best investment I made for my peace of mind. Truly gifted advisor.'
  },
  {
    id: 'rev-47',
    name: 'Violet Cox',
    location: 'Sydney, Australia',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 months ago',
    topic: 'Relationship Bridge',
    text: 'Helped me rebuild communication after 6 months of absolute silence.'
  },
  {
    id: 'rev-48',
    name: 'Owen Richardson',
    location: 'Ottawa, Canada',
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 months ago',
    topic: 'Work Alignment',
    text: 'Gave me a sharp perspective on toxic office politics. Navigated it smoothly.'
  },
  {
    id: 'rev-49',
    name: 'Aurora Phillips',
    location: 'Washington, DC',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '2 months ago',
    topic: 'Love Destiny',
    text: 'Her cards predicted a reunion before the holidays. It happened just like that!'
  },
  {
    id: 'rev-50',
    name: 'Julian Barnes',
    location: 'Las Vegas, NV',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 months ago',
    topic: 'Personal Rebirth',
    text: 'Helped me release old baggage and embrace the next chapter of life with open arms.'
  },
  {
    id: 'rev-51',
    name: 'Serena Patel',
    location: 'Birmingham, UK',
    avatar: 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 months ago',
    topic: 'Marriage Harmony',
    text: 'A profound reading that guided my husband and me to re-open our hearts. Deep gratitude.'
  },
  {
    id: 'rev-52',
    name: 'Dominic Foster',
    location: 'Miami, FL',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 months ago',
    topic: 'Financial Timing',
    text: 'Told me to wait until Mercury retrograde cleared before closing the real estate purchase. Saved tens of thousands.'
  },
  {
    id: 'rev-53',
    name: 'Camilla Rossi',
    location: 'Florence, Italy',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 months ago',
    topic: 'Spiritual Guide',
    text: 'Everything she said resonated deeply. Accurate timelines, compassionate tone, and true spiritual presence.'
  },
  {
    id: 'rev-54',
    name: 'Tristan Vance',
    location: 'Auckland, New Zealand',
    avatar: 'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 months ago',
    topic: 'Clarity on Past',
    text: 'Brought total clarity to lingering questions I had held for over 5 years. Incredible gift.'
  },
  {
    id: 'rev-55',
    name: 'Genevieve Leclair',
    location: 'Montreal, Canada',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    rating: 5,
    date: '3 months ago',
    topic: 'Soul Alignment',
    text: 'One of the most accurate and uplifting sessions I have ever experienced. Will be returning regularly.'
  }
];
