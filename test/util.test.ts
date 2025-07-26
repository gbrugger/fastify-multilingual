import assert from 'node:assert';
import { test } from 'node:test';
import { findLocale } from '../dist/util.js';

process.setMaxListeners(0);

// Type definitions for testing
type LocaleArray = readonly string[] | null | undefined;

// Helper function to safely test invalid inputs without type warnings
function testFindLocaleWithInvalidInput (
  preferred: unknown,
  available: unknown
): string | null {
  return findLocale(preferred as LocaleArray, available as LocaleArray);
}

// findLocale
test('findLocale - exact match cases', async (t) => {
  t.plan(3);
  await t.test('should return exact match when available', () => {
    const preferred = ['en-US', 'fr-FR'];
    const available = ['es-ES', 'en-US', 'de-DE'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, 'en-US');
  });

  await t.test('should return first exact match from preferred order', () => {
    const preferred = ['fr-FR', 'en-US', 'es-ES'];
    const available = ['en-US', 'es-ES', 'fr-FR'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, 'fr-FR');
  });

  await t.test('should be case insensitive for exact matches', () => {
    const preferred = ['EN-us', 'fr-FR'];
    const available = ['es-ES', 'en-US', 'de-DE'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, 'en-US');
  });
});

test('findLocale - language fallback cases', async (t) => {
  t.plan(5);
  await t.test(
    'should fallback to language-only match when no exact match',
    () => {
      const preferred = ['en-US', 'fr-CA'];
      const available = ['es-ES', 'en', 'de-DE'];
      const result = findLocale(preferred, available);
      assert.strictEqual(result, 'en');
    }
  );

  await t.test(
    'should match language prefix (preferred starts with available)',
    () => {
      const preferred = ['en-US', 'fr-CA'];
      const available = ['es', 'en', 'de'];
      const result = findLocale(preferred, available);
      assert.strictEqual(result, 'en');
    }
  );

  await t.test(
    'should match language prefix (available starts with preferred)',
    () => {
      const preferred = ['en', 'fr'];
      const available = ['es-ES', 'en-US', 'de-DE'];
      const result = findLocale(preferred, available);
      assert.strictEqual(result, 'en-US');
    }
  );

  await t.test('should be case insensitive for language fallback', () => {
    const preferred = ['EN-us', 'FR-ca'];
    const available = ['es-ES', 'en', 'de-DE'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, 'en');
  });

  await t.test('should prefer exact match over language fallback', () => {
    const preferred = ['en-US', 'fr-FR'];
    const available = ['en-GB', 'fr-FR', 'en-US'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, 'en-US');
  });
});

test('findLocale - null/undefined input cases', async (t) => {
  t.plan(5);
  await t.test('should return null for null preferredLocales', () => {
    const result = findLocale(null, ['en-US', 'fr-FR']);
    assert.strictEqual(result, null);
  });

  await t.test('should return null for undefined preferredLocales', () => {
    const result = findLocale(undefined, ['en-US', 'fr-FR']);
    assert.strictEqual(result, null);
  });

  await t.test('should return null for null availableLocales', () => {
    const result = findLocale(['en-US', 'fr-FR'], null);
    assert.strictEqual(result, null);
  });

  await t.test('should return null for undefined availableLocales', () => {
    const result = findLocale(['en-US', 'fr-FR'], undefined);
    assert.strictEqual(result, null);
  });

  await t.test('should return null when both are null', () => {
    const result = findLocale(null, null);
    assert.strictEqual(result, null);
  });
});

test('findLocale - empty array cases', async (t) => {
  t.plan(3);
  await t.test('should return null for empty preferredLocales', () => {
    const result = findLocale([], ['en-US', 'fr-FR']);
    assert.strictEqual(result, null);
  });

  await t.test('should return null for empty availableLocales', () => {
    const result = findLocale(['en-US', 'fr-FR'], []);
    assert.strictEqual(result, null);
  });

  await t.test('should return null when both arrays are empty', () => {
    const result = findLocale([], []);
    assert.strictEqual(result, null);
  });
});

test('findLocale - non-array input cases', async (t) => {
  t.plan(4);
  await t.test('should return null for non-array preferredLocales', () => {
    const invalidInput = 'en-US';
    const result = testFindLocaleWithInvalidInput(invalidInput, ['en-US', 'fr-FR']);
    assert.strictEqual(result, null);
  });

  await t.test('should return null for non-array availableLocales', () => {
    const invalidInput = 'en-US';
    const result = testFindLocaleWithInvalidInput(['en-US', 'fr-FR'], invalidInput);
    assert.strictEqual(result, null);
  });

  await t.test('should return null for object preferredLocales', () => {
    const invalidInput = { locale: 'en-US' };
    const result = testFindLocaleWithInvalidInput(invalidInput, ['en-US', 'fr-FR']);
    assert.strictEqual(result, null);
  });

  await t.test('should return null for number inputs', () => {
    const invalidInput = 123;
    const result = testFindLocaleWithInvalidInput(invalidInput, ['en-US', 'fr-FR']);
    assert.strictEqual(result, null);
  });
});

test('findLocale - mixed data type arrays', async (t) => {
  t.plan(3);
  await t.test('should skip non-string entries in preferredLocales', () => {
    const preferred = [123, 'en-US', null, 'fr-FR', undefined];
    const available = ['es-ES', 'en-US', 'de-DE'];
    const result = testFindLocaleWithInvalidInput(preferred, available);
    assert.strictEqual(result, 'en-US');
  });

  await t.test('should skip non-string entries in availableLocales', () => {
    const preferred = ['en-US', 'fr-FR'];
    const available = [123, 'es-ES', null, 'en-US', undefined];
    const result = testFindLocaleWithInvalidInput(preferred, available);
    assert.strictEqual(result, 'en-US');
  });

  await t.test('should handle all non-string entries gracefully', () => {
    const preferred = [123, null, undefined, {}];
    const available = [456, null, undefined, []];
    const result = testFindLocaleWithInvalidInput(preferred, available);
    assert.strictEqual(result, null);
  });
});

test('findLocale - no match cases', async (t) => {
  t.plan(2);
  await t.test(
    'should return null when no exact or language match exists',
    () => {
      const preferred = ['en-US', 'fr-FR'];
      const available = ['es-ES', 'de-DE', 'it-IT'];
      const result = findLocale(preferred, available);
      assert.strictEqual(result, null);
    }
  );

  await t.test(
    'should return null for completely different language families',
    () => {
      const preferred = ['zh-CN', 'ja-JP'];
      const available = ['en-US', 'fr-FR', 'es-ES'];
      const result = findLocale(preferred, available);
      assert.strictEqual(result, null);
    }
  );
});

test('findLocale - complex matching scenarios', async (t) => {
  t.plan(4);
  await t.test('should handle multiple language variants correctly', () => {
    const preferred = ['en-AU', 'en-CA', 'en-US'];
    const available = ['fr-FR', 'en', 'es-ES'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, 'en');
  });

  await t.test('should prioritize preferred order in language fallback', () => {
    const preferred = ['fr-CA', 'en-US'];
    const available = ['en', 'fr', 'es-ES'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, 'fr');
  });

  await t.test(
    'should respect preference order with mixed exact and fallback matches',
    () => {
      const preferred = ['en-GB', 'pt-BR'];
      const available = ['pt-BR', 'en'];
      const result = findLocale(preferred, available);
      assert.strictEqual(result, 'en');
    }
  );

  await t.test('should handle edge case with single character locales', () => {
    const preferred = ['a', 'b'];
    const available = ['a-US', 'b-FR'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, 'a-US');
  });
});

test('findLocale - error handling', async (t) => {
  t.plan(6);
  await t.test(
    'should return null and not throw on malformed locale strings',
    () => {
      const preferred = ['invalid-locale', 'en-US'];
      const available = ['fr-FR', 'en-US'];
      const result = findLocale(preferred, available);
      assert.strictEqual(result, 'en-US');
    }
  );

  await t.test('should handle empty strings in preferred locales', () => {
    const preferred = ['it', ''];
    const available = ['fr-FR', 'en-US'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, null);
  });

  await t.test('should handle empty strings in available locales', () => {
    const preferred = ['en-US', 'fr-FR'];
    const available = ['', 'it-IT'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, null);
  });

  await t.test('should handle empty strings in both arrays', () => {
    const preferred = ['en-US', ''];
    const available = ['', 'fr-FR'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, null);
  });

  await t.test(
    'should not throw when empty string causes startsWith issues',
    () => {
      assert.doesNotThrow(() => {
        const preferred = ['', 'en-US'];
        const available = ['fr-FR', 'en-US'];
        const result = findLocale(preferred, available);
        assert.strictEqual(result, 'en-US');
      });
    }
  );

  await t.test('should handle very long locale strings', () => {
    const longLocale = 'a'.repeat(1000);
    const preferred = [longLocale, 'en-US'];
    const available = ['en-US', longLocale];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, longLocale);
  });
});
