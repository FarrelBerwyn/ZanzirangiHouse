// Homepage section content managed in Admin → Halaman Home → "Konten Section".
// Stored in page_contents['home'].contentJson.homeSections, keyed by homepage section id.
// Rule for every field: a non-empty CMS value replaces the built-in multilingual text for all
// languages; an empty value keeps the built-in translations.

export type HomeSectionContent = Record<string, any>;
export type HomeSectionsContent = Record<string, HomeSectionContent>;

export const cmsText = (value: unknown, fallback: string): string =>
  typeof value === 'string' && value.trim() ? value : fallback;

/**
 * For CMS-managed items that also ship built-in translations (gallery, facilities, reviews):
 * show the translation only while the stored value is still a built-in default (seed or English).
 * Once an admin edits the text, the edited value wins in every language.
 */
export const localizeUnlessEdited = (
  cmsValue: string | undefined,
  seedValue: string | undefined,
  englishValue: string | undefined,
  localizedValue: string | undefined
): string => {
  if (!cmsValue) return localizedValue || seedValue || '';
  if (cmsValue === seedValue || cmsValue === englishValue) return localizedValue || cmsValue;
  return cmsValue;
};

const sameList = (a: string[] | undefined, b: string[] | undefined): boolean =>
  !!a && !!b && a.length === b.length && a.every((item, i) => item === b[i]);

/** List counterpart of localizeUnlessEdited (amenities, highlights, ...). */
export const localizeListUnlessEdited = (
  cmsValue: string[] | undefined,
  seedValue: string[] | undefined,
  englishValue: string[] | undefined,
  localizedValue: string[] | undefined
): string[] => {
  const localized = localizedValue && localizedValue.length > 0 ? localizedValue : undefined;
  if (!cmsValue || cmsValue.length === 0) return localized || seedValue || [];
  if (sameList(cmsValue, seedValue) || sameList(cmsValue, englishValue)) return localized || cmsValue;
  return cmsValue;
};

export const cmsList =<T,>(value: unknown, fallback: T[]): T[] =>
  Array.isArray(value) && value.length > 0 ? (value as T[]) : fallback;
