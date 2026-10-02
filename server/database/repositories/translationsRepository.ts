import { getDatabaseAdapter } from '../index.ts';
import { ContentTranslationRecord } from '../adapter.ts';

export const SUPPORTED_TRANSLATION_LANGS = ['pl', 'ar', 'zh', 'fr', 'sw', 'es', 'it'];

export class TranslationsRepository {
  async getForLanguage(lang: string): Promise<ContentTranslationRecord[]> {
    return getDatabaseAdapter().getContentTranslations(lang);
  }

  /** Public shape: { entity: { path: value } } */
  async getMapForLanguage(lang: string): Promise<Record<string, Record<string, string>>> {
    const rows = await this.getForLanguage(lang);
    const map: Record<string, Record<string, string>> = {};
    rows.forEach((r) => {
      if (!r.value) return;
      (map[r.entity] = map[r.entity] || {})[r.path] = r.value;
    });
    return map;
  }

  async save(lang: string, entries: ContentTranslationRecord[], userEmail: string): Promise<number> {
    return getDatabaseAdapter().saveContentTranslations(lang, entries, userEmail);
  }
}

export const translationsRepository = new TranslationsRepository();
