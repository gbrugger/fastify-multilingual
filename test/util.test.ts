import assert from 'node:assert';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { findLocale, loadDictionaries } from '../dist/util.js';

// findLocale
test('findLocale - exact match cases', async (t) => {
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
  await t.test('should return null for non-array preferredLocales', () => {
    const result = findLocale('en-US' as any, ['en-US', 'fr-FR']);
    assert.strictEqual(result, null);
  });

  await t.test('should return null for non-array availableLocales', () => {
    const result = findLocale(['en-US', 'fr-FR'], 'en-US' as any);
    assert.strictEqual(result, null);
  });

  await t.test('should return null for object preferredLocales', () => {
    const result = findLocale({ locale: 'en-US' } as any, ['en-US', 'fr-FR']);
    assert.strictEqual(result, null);
  });

  await t.test('should return null for number inputs', () => {
    const result = findLocale(123 as any, ['en-US', 'fr-FR']);
    assert.strictEqual(result, null);
  });
});

test('findLocale - mixed data type arrays', async (t) => {
  await t.test('should skip non-string entries in preferredLocales', () => {
    const preferred = [123, 'en-US', null, 'fr-FR', undefined];
    const available = ['es-ES', 'en-US', 'de-DE'];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, 'en-US');
  });

  await t.test('should skip non-string entries in availableLocales', () => {
    const preferred = ['en-US', 'fr-FR'];
    const available = [123, 'es-ES', null, 'en-US', undefined];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, 'en-US');
  });

  await t.test('should handle all non-string entries gracefully', () => {
    const preferred = [123, null, undefined, {}];
    const available = [456, null, undefined, []];
    const result = findLocale(preferred, available);
    assert.strictEqual(result, null);
  });
});

test('findLocale - no match cases', async (t) => {
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

// loadDictionaries
test('loadDictionaries - success cases', async (t) => {
  const testDir = join(process.cwd(), 'test-dictionaries');

  t.beforeEach(async () => {
    await rm(testDir, { recursive: true, force: true });
    await mkdir(testDir, { recursive: true });
  });

  // t.afterEach(async () => {
  //   await rm(testDir, { recursive: true, force: true });
  // });

  await t.test('should load single dictionary file with default export', async () => {
    const dutchContent = `
    export default { 
      hello: "Hallo", 
      goodbye: "Tot ziens"
    };`;
    await writeFile(join(testDir, 'dutch.js'), dutchContent);

    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {
      dutch: { hello: 'Hallo', goodbye: 'Tot ziens' }
    });
  });

  await t.test('should load multiple dictionary files with phrases export', async () => {
    const frContent = `
    export const phrases = { 
      hello: "Bonjour" 
    };`;

    const deContent = `
    export const phrases = { 
      hello: "Hallo" 
    };`;

    await writeFile(join(testDir, 'fr.js'), frContent);
    await writeFile(join(testDir, 'de.js'), deContent);

    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {
      fr: { hello: 'Bonjour' },
      de: { hello: 'Hallo' }
    });
  });

  await t.test('should ignore non-js files', async () => {
    const esContent = 'export const phrases = { hello: "Hola" };';

    await writeFile(join(testDir, 'es.js'), esContent);
    await writeFile(join(testDir, 'readme.txt'), 'This is a readme');
    await writeFile(join(testDir, 'config.json'), '{"key": "value"}');

    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {
      es: { hello: 'Hola' }
    });
  });

  await t.test('should return empty object when no js files exist', async () => {
    await writeFile(join(testDir, 'readme.txt'), 'No JS files here');

    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {});
  });

  await t.test('should handle empty directory', async () => {
    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {});
  });
});

test('loadDictionaries - error handling', async (t) => {
  const testDir = join(process.cwd(), 'test-dictionaries');

  t.beforeEach(async () => {
    await rm(testDir, { recursive: true, force: true });
    await mkdir(testDir, { recursive: true });
  });

  t.afterEach(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  await t.test('should throw error for non-existent directory', async () => {
    const nonExistentDir = join(process.cwd(), 'non-existent-directory');

    await assert.rejects(
      async () => await loadDictionaries(nonExistentDir),
      /Failed to read dictionary directory/
    );
  });

  await t.test('should skip malformed js files and continue loading others', async () => {
    const validContent = 'export const phrases = { hello: "Olá" };';
    const invalidContent = 'this is not valid javascript syntax {{{';

    await writeFile(join(testDir, 'pt.js'), validContent);
    await writeFile(join(testDir, 'invalid.js'), invalidContent);

    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {
      pt: { hello: 'Olá' }
    });
  });

  await t.test('should skip files without matching export structure', async () => {
    const validContent = `
    export const phrases = { 
      hello: "Olá" 
    };`;

    const noExportContent = 'export const noexport = { hello: "Wrong" };';
    const wrongStructureContent = 'export const ja = { hello: "Wrong structure" };';

    await writeFile(join(testDir, 'pt.js'), validContent);
    await writeFile(join(testDir, 'noexport.js'), noExportContent);
    await writeFile(join(testDir, 'ja.js'), wrongStructureContent);

    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {
      pt: { hello: 'Olá' }
    });
  });

  await t.test('should handle files with complex nested structure', async () => {
    const complexContent = `export default {
      navigation: { home: "Casa", about: "Chi siamo" },
      messages: { welcome: "Benvenuto", error: "Errore" }
    };`;

    await writeFile(join(testDir, 'it.js'), complexContent);

    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {
      it: {
        navigation: { home: 'Casa', about: 'Chi siamo' },
        messages: { welcome: 'Benvenuto', error: 'Errore' }
      }
    });
  });

  await t.test('should prefer default export over phrases export', async () => {
    const content = `
    export default { hello: "Default Hello" };
    export const phrases = { hello: "Phrases Hello" };`;

    await writeFile(join(testDir, 'en.js'), content);

    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {
      en: { hello: 'Default Hello' }
    });
  });

  await t.test('should use default export when phrases is the default export', async () => {
    const content = `
    export const phrases = {
      hi: "g'day",
    };
    export default phrases;`;

    await writeFile(join(testDir, 'en-AU.js'), content);

    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {
      'en-AU': { hi: "g'day" }
    });
  });

  await t.test('should use phrases export when no default export', async () => {
    const content = 'export const phrases = { hello: "Phrases Hello" };';

    await writeFile(join(testDir, 'en-GB.js'), content);

    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {
      'en-GB': { hello: 'Phrases Hello' }
    });
  });

  await t.test('should skip files without default or phrases export but load valid ones', async () => {
    const validContent = `
    export default { 
      hello: "Valid" 
    };`;

    const invalidContent = `
    export const other = { 
      hello: "Invalid" 
    };`;

    await writeFile(join(testDir, 'valid_export.js'), validContent);
    await writeFile(join(testDir, 'invalid_export.js'), invalidContent);

    const result = await loadDictionaries(testDir);

    assert.deepStrictEqual(result, {
      valid_export: { hello: 'Valid' }
    });
  });
});
