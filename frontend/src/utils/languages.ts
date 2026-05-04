/**
 * ISO 639-1 språkkoder. Listan är stabil — senaste tillägg gjordes 2009.
 * Namnen lokaliserar vi via Intl.DisplayNames istället för att underhålla
 * dem själva, så vi slipper hålla en separat svensk översättningslista
 * synkad.
 */
export const ISO_639_1_CODES = [
  'aa', 'ab', 'ae', 'af', 'ak', 'am', 'an', 'ar', 'as', 'av', 'ay', 'az',
  'ba', 'be', 'bg', 'bh', 'bi', 'bm', 'bn', 'bo', 'br', 'bs',
  'ca', 'ce', 'ch', 'co', 'cr', 'cs', 'cu', 'cv', 'cy',
  'da', 'de', 'dv', 'dz',
  'ee', 'el', 'en', 'eo', 'es', 'et', 'eu',
  'fa', 'ff', 'fi', 'fj', 'fo', 'fr', 'fy',
  'ga', 'gd', 'gl', 'gn', 'gu', 'gv',
  'ha', 'he', 'hi', 'ho', 'hr', 'ht', 'hu', 'hy', 'hz',
  'ia', 'id', 'ie', 'ig', 'ii', 'ik', 'io', 'is', 'it', 'iu',
  'ja', 'jv',
  'ka', 'kg', 'ki', 'kj', 'kk', 'kl', 'km', 'kn', 'ko', 'kr', 'ks', 'ku', 'kv', 'kw', 'ky',
  'la', 'lb', 'lg', 'li', 'ln', 'lo', 'lt', 'lu', 'lv',
  'mg', 'mh', 'mi', 'mk', 'ml', 'mn', 'mr', 'ms', 'mt', 'my',
  'na', 'nb', 'nd', 'ne', 'ng', 'nl', 'nn', 'no', 'nr', 'nv', 'ny',
  'oc', 'oj', 'om', 'or', 'os',
  'pa', 'pi', 'pl', 'ps', 'pt',
  'qu',
  'rm', 'rn', 'ro', 'ru', 'rw',
  'sa', 'sc', 'sd', 'se', 'sg', 'si', 'sk', 'sl', 'sm', 'sn', 'so', 'sq', 'sr', 'ss', 'st', 'su', 'sv', 'sw',
  'ta', 'te', 'tg', 'th', 'ti', 'tk', 'tl', 'tn', 'to', 'tr', 'ts', 'tt', 'tw', 'ty',
  'ug', 'uk', 'ur', 'uz',
  've', 'vi', 'vo',
  'wa', 'wo',
  'xh',
  'yi', 'yo',
  'za', 'zh', 'zu',
] as const;

export interface LanguageOption {
  code: string;
  name: string;
}

/**
 * Returnerar språkkoderna med lokaliserade namn på det angivna språket,
 * sorterade alfabetiskt enligt locale-collation.
 *
 * Koder som inte kan översättas (t.ex. äldre browsers utan ICU-data)
 * filtreras bort — Intl.DisplayNames returnerar då koden själv som
 * "namn", vilket inte hjälper användaren.
 */
export const getLanguageOptions = (locale: string = 'sv'): LanguageOption[] => {
  const displayNames = new Intl.DisplayNames([locale], { type: 'language' });
  const collator = new Intl.Collator(locale);

  return ISO_639_1_CODES.map((code) => {
    const raw = displayNames.of(code) ?? code;
    return { code, name: raw.charAt(0).toLocaleUpperCase(locale) + raw.slice(1) };
  })
    .filter((option) => option.name.toLowerCase() !== option.code)
    .sort((a, b) => collator.compare(a.name, b.name));
};
