import createError from '@fastify/error';
import { readdir } from 'fs/promises';
import { basename, extname, join } from 'path';

type LocaleArray = readonly string[] | null | undefined;

/**
 * Loads dictionary files from a directory and returns them as messages object.
 * Scans for .js files and imports them expecting default exports or named exports for "phrases".
 * The resulting message object will match the filename without extension (eg: "en", "it", "pt-BR").
 *
 * @param {string} dictionaryPath - Path to the directory containing dictionary files
 * @returns {Promise<Record<string, Record<string, string>>>} Object with locale keys and their phrase dictionaries
 */
export const loadDictionaries = async (dictionaryPath: string): Promise<Record<string, Record<string, string>>> => {
  const messages: Record<string, Record<string, string>> = {};

  try {
    const files = await readdir(dictionaryPath);
    const jsFiles = files.filter(file => extname(file) === '.js');

    for (const file of jsFiles) {
      const locale = basename(file, '.js');
      const filePath = join(dictionaryPath, file);

      try {
        const module = await import(filePath);

        if (module.default) {
          messages[locale] = module.default;
        } else if (module.phrases) {
          messages[locale] = module.phrases;
        }
      } catch (error) {
        console.warn(`Failed to load dictionary file ${file}:`, error);
      }
    }
  } catch (error: unknown) {
    const cause = error instanceof Error ? error : new Error(String(error));
    const DirectoryReadError = createError<[string, { cause: Error }]>('FST_MULTILINGUAL_NO_DICTIONARY', 'Failed to read dictionary directory %s.');

    throw new DirectoryReadError(dictionaryPath, { cause });
  }

  return messages;
};

/**
 * Finds the best matching locale from available locales based on user preferences.
 * Performs exact match first, then falls back to language-only matching.
 * Testing for Locale validity is out of the scope of this function.
 *
 * @param {string[]} preferredLocales - Array of preferred locales in order of preference (e.g., ['en-US', 'en', 'es'])
 * @param {string[]} availableLocales - Array of available locales to match against (e.g., ['en-US', 'fr-FR', 'es-ES'])
 * @returns {string|null} The best matching available locale in order of preferredLocales, or null if no match found
 */
export const findLocale = (preferredLocales: LocaleArray, availableLocales: LocaleArray): string | null => {
  // Input validation
  if (
    !preferredLocales ||
    !availableLocales ||
    !Array.isArray(preferredLocales) ||
    !Array.isArray(availableLocales) ||
    preferredLocales?.length === 0 ||
    availableLocales?.length === 0
  ) { return null; }

  try {
    let found: string | null = null;

    for (const preferred of preferredLocales) {
      // Try exact match first
      if (!preferred || typeof preferred !== 'string') continue;

      found =
        availableLocales.find(
          (available) =>
            typeof available === 'string' &&
            available.toLowerCase() === preferred.toLowerCase()
        ) || null; // For consistent return. null explicitly means no value.

      if (found) break;

      // Fallback. Try language only 'xx' match
      found =
        availableLocales.find(
          (available) =>
            available &&
            typeof available === 'string' &&
            (available.toLowerCase().startsWith(preferred.toLowerCase()) ||
              preferred.toLowerCase().startsWith(available.toLowerCase()))
        ) || null;

      if (found) break;
    }

    return found;
  } catch {
    return null;
  }
};
