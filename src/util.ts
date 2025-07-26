type LocaleArray = readonly string[] | null | undefined;

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
