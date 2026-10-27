import { Reader } from '../types';

export interface ReaderSkillBadge {
  label: string;
  isLove: boolean;
}

/**
 * Returns distinct, clean skills for each reader:
 * - Tarot readers display Tarot and their specific tarot techniques (not generic psychic)
 * - Psychic readers display Psychic and their psychic focus (e.g. Clairvoyance, Empath)
 * - Love specialists feature Love/Soulmates
 * - Vedic/Astrology specialists feature Vedic/Astrology
 * - Different readers have different skills as requested.
 */
export function getReaderSkillBadges(reader: Reader): ReaderSkillBadge[] {
  const nameLower = (reader.name || '').toLowerCase();
  const titleLower = (reader.title || '').toLowerCase();
  const categoryLower = (reader.category || '').toLowerCase();
  const bioLower = (reader.bio || '').toLowerCase();
  const rawSpecs = (reader.specialties || reader.specialities || []).map(s => s.toLowerCase());

  const isTarot = nameLower.includes('tarot') || 
                  titleLower.includes('tarot') || 
                  categoryLower.includes('tarot') ||
                  rawSpecs.some(s => s.includes('tarot')) ||
                  bioLower.includes('tarot');

  const isPsychic = (nameLower.includes('psychic') || 
                    titleLower.includes('psychic') || 
                    categoryLower.includes('psychic') ||
                    rawSpecs.some(s => s.includes('psychic')) ||
                    bioLower.includes('psychic')) && !nameLower.includes('tarot');

  const isVedic = titleLower.includes('vedic') || 
                  categoryLower.includes('vedic') || 
                  rawSpecs.some(s => s.includes('vedic')) ||
                  bioLower.includes('vedic');

  const isAstrology = titleLower.includes('astrolog') || 
                      categoryLower.includes('astrolog') || 
                      rawSpecs.some(s => s.includes('astrolog'));

  const isClairvoyant = titleLower.includes('clairvoyan') || 
                        rawSpecs.some(s => s.includes('clairvoyan')) ||
                        bioLower.includes('clairvoyan');

  const hasLove = rawSpecs.some(s => s.includes('love') || s.includes('relationship') || s.includes('soulmate') || s.includes('twin flame')) ||
                  titleLower.includes('love') ||
                  bioLower.includes('love');

  const hasCareer = rawSpecs.some(s => s.includes('career') || s.includes('work') || s.includes('wealth')) ||
                    titleLower.includes('career');

  const hasTwinFlame = rawSpecs.some(s => s.includes('twin flame') || s.includes('soul connection')) ||
                       bioLower.includes('twin flame');

  const hasSoulmate = rawSpecs.some(s => s.includes('soulmate') || s.includes('marriage')) ||
                      bioLower.includes('soulmate');

  const badges: ReaderSkillBadge[] = [];

  // Primary skill - distinctly separated (strictly omitting 'Tarot', 'Deck', and 'Crystal' tags per user requirements)
  if (isPsychic) {
    badges.push({ label: 'Psychic', isLove: false });
  } else if (isVedic) {
    badges.push({ label: 'Vedic', isLove: false });
  } else if (isAstrology) {
    badges.push({ label: 'Astrology', isLove: false });
  } else if (!isTarot) {
    badges.push({ label: 'Intuitive', isLove: false });
  }

  // Second skill - specialized to this reader's focus
  if (isClairvoyant && !badges.some(b => b.label === 'Clairvoyant')) {
    badges.push({ label: 'Clairvoyant', isLove: false });
  } else if (hasTwinFlame) {
    badges.push({ label: 'Twin Flame', isLove: true });
  } else if (hasSoulmate) {
    badges.push({ label: 'Soulmate', isLove: true });
  } else if (hasLove) {
    badges.push({ label: 'Love', isLove: true });
  } else if (hasCareer) {
    badges.push({ label: 'Career', isLove: false });
  } else if (isAstrology && !badges.some(b => b.label === 'Astrology')) {
    badges.push({ label: 'Astrology', isLove: false });
  } else {
    badges.push({ label: 'Intuition', isLove: false });
  }

  // Third skill - distinct modifier
  if (hasCareer && !badges.some(b => b.label === 'Career')) {
    badges.push({ label: 'Career', isLove: false });
  } else if (hasLove && !badges.some(b => b.label === 'Love' || b.label === 'Soulmate' || b.label === 'Twin Flame')) {
    badges.push({ label: 'Love', isLove: true });
  } else if (isVedic && !badges.some(b => b.label === 'Vedic')) {
    badges.push({ label: 'Kundli', isLove: false });
  } else if (isTarot && !badges.some(b => b.label === 'Spreads')) {
    badges.push({ label: 'Spreads', isLove: false });
  } else if (bioLower.includes('empath') || titleLower.includes('empath')) {
    badges.push({ label: 'Empath', isLove: false });
  } else if (bioLower.includes('healing')) {
    badges.push({ label: 'Healing', isLove: false });
  } else if (bioLower.includes('destiny')) {
    badges.push({ label: 'Destiny', isLove: false });
  } else {
    badges.push({ label: 'Guidance', isLove: false });
  }

  // Strictly filter out any 'Tarot', 'Deck', or 'Crystal' tags/badges to keep profile cards clean
  return badges.filter(b => {
    const l = b.label.toLowerCase().trim();
    return l !== 'tarot' && l !== 'deck' && l !== 'tarot deck' && l !== 'crystal' && l !== 'crystals' && l !== 'crystal ball';
  }).slice(0, 3);
}

/**
 * Returns a cleanly formatted string of skills without bubbles (e.g. "Tarot · Love · Spreads")
 */
export function getReaderSkillsText(reader: Reader, separator: string = ' · '): string {
  return getReaderSkillBadges(reader).map(b => b.label).join(separator);
}
