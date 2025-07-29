import { EventEmitter } from 'events';
import { build } from 'fastify-cli/helper.js';
import assert from 'node:assert';
import { test } from 'node:test';
import { phrases } from './i18n/index.js';

EventEmitter.defaultMaxListeners = 20;

const logger = {
  transport: {
    target: 'pino-pretty',
    options: {
      destination: 2,
    },
  },
};
const argv = ['test-build/app.js'];

test('plugin  - cases with default Locale', async t => {
  t.plan(5);

  const options = {
    multilingual: {
      phrases,
      defaultTranslation: 'en'
    },
    skipOverride: false // If you want your application to be registered with fastify-plugin
  };

  await t.test('should return phrases based on accept-language header', async () => {
    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    const en = {
      hi: 'Hi',
      not_found: 'Page not found'
    };

    const it = {
      hi: 'Ciao',
      not_found: 'Pagina non trovata'
    };

    const responseEn = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'en,it,pt-BR',
      }
    });
    assert.strictEqual(responseEn.statusCode, 200);
    assert.deepStrictEqual(responseEn.json(), en);

    const responseIt = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'it,pt-BR,en',
      }
    });
    assert.strictEqual(responseIt.statusCode, 200);
    assert.deepStrictEqual(responseIt.json(), it);
  });

  await t.test('should return phrases for default Locale on no accept-language header', async () => {
    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    // defaulLocale is en #L22
    const en = {
      hi: 'Hi',
      not_found: 'Page not found'
    };

    const responseEn = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
      }
    });
    assert.strictEqual(responseEn.statusCode, 200);
    assert.deepStrictEqual(responseEn.json(), en);
  });

  await t.test('should return phrases for default Locale on accept-language header not found', async () => {
    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    const en = {
      hi: 'Hi',
      not_found: 'Page not found'
    };

    const responseDe = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'de-DE',
      }
    });
    assert.strictEqual(responseDe.statusCode, 200);
    assert.deepStrictEqual(responseDe.json(), en);
  });

  await t.test('should return phrases for partial match of accept-language header', async () => {
    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    // pt matches pt-BR and vice-versa
    const pt = {
      hi: 'Olá',
      not_found: 'Página não encontrada'
    };

    const responsePt = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'pt',
      }
    });
    assert.strictEqual(responsePt.statusCode, 200);
    assert.deepStrictEqual(responsePt.json(), pt);
  });

  await t.test('should return keys for phrases not found', async () => {
    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    const es = {
      hi: 'Hola',
      not_found: 'not_found'
    };

    const responseEs = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'es',
      }
    });
    assert.strictEqual(responseEs.statusCode, 200);
    assert.deepStrictEqual(responseEs.json(), es);
  });
});

test('plugin - cases without default Locale', async t => {
  t.plan(2);

  const options = {
    multilingual: {
      phrases,
    },
    skipOverride: false
  };

  await t.test('should return phrases based on accept-language header', async () => {
    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    const it = {
      hi: 'Ciao',
      not_found: 'Pagina non trovata'
    };

    const responseIt = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'it,en',
      }
    });
    assert.strictEqual(responseIt.statusCode, 200);
    assert.deepStrictEqual(responseIt.json(), it);
  });

  await t.test('should return keys on accept-language header not found', async () => {
    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    const fallback = {
      hi: 'hi',
      not_found: 'not_found'
    };

    const responseDe = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'de-DE',
      }
    });
    assert.strictEqual(responseDe.statusCode, 200);
    assert.deepStrictEqual(responseDe.json(), fallback);
  });
});

test('plugin - Edge Cases', async t => {
  t.plan(3);

  const options = {
    multilingual: {
      phrases,
      defaultTranslation: 'en'
    },
    skipOverride: false
  };

  await t.test('should handle empty accept-language header same as missing header', async () => {
    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    const en = {
      hi: 'Hi',
      not_found: 'Page not found'
    };

    const responseEmpty = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': '',
      }
    });
    assert.strictEqual(responseEmpty.statusCode, 200);
    assert.deepStrictEqual(responseEmpty.json(), en);
  });

  await t.test('should handle malformed accept-language header gracefully', async () => {
    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    const en = {
      hi: 'Hi',
      not_found: 'Page not found'
    };

    const responseMalformed = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': ';;;invalid,,,syntax',
      }
    });
    assert.strictEqual(responseMalformed.statusCode, 200);
    assert.deepStrictEqual(responseMalformed.json(), en);
  });

  await t.test('should handle case sensitivity in locale codes', async () => {
    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    const en = {
      hi: 'Hi',
      not_found: 'Page not found'
    };

    const responseUppercase = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'EN,IT',
      }
    });
    assert.strictEqual(responseUppercase.statusCode, 200);
    assert.deepStrictEqual(responseUppercase.json(), en);
  });
});

test('plugin - nested phrases', async t => {
  t.plan(1);

  const options = {
    multilingual: {
      phrases,
      defaultTranslation: 'en'
    },
    skipOverride: false
  };

  await t.test('should handle nested phrase values', async () => {
    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    const enGB = {
      hi: 'Hi',
      not_found: 'Page not found',
      nested: {
        other: 'Other nested value'
      }
    };

    const response = await fastify.inject({
      method: 'GET',
      url: '/nested',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'en-GB',
      }
    });
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.json(), enGB);
  });
});

test('plugin - Configuration Edge Cases', async t => {
  t.plan(3);

  await t.test('should emit warning when no phrases are provided', async () => {
    let warningOutput = '';
    const originalStderr = process.stderr.write;
    process.stderr.write = (chunk: any) => {
      warningOutput += chunk.toString();
      return true;
    };

    const emptyOptions = {
      multilingual: {
        phrases: {},
        defaultTranslation: 'en'
      },
      skipOverride: false
    };

    const fastify = await build(argv, emptyOptions, { logger });
    t.after(() => {
      fastify.close();
      process.stderr.write = originalStderr;
    });

    assert.ok(warningOutput.includes('No phrases provided to fastify-multilingual. Will return keys.'));
    assert.ok(warningOutput.includes('FST_ML_WARN_NO_PHRASES'));
  });

  await t.test('should handle empty phrases object', async () => {
    const emptyOptions = {
      multilingual: {
        phrases: {},
        defaultTranslation: 'en'
      },
      skipOverride: false
    };

    const fastify = await build(argv, emptyOptions, { logger });
    t.after(() => fastify.close());

    const fallback = {
      hi: 'hi',
      not_found: 'not_found'
    };

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'en',
      }
    });
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.json(), fallback);
  });

  await t.test('should handle defaultTranslation as empty string', async () => {
    const emptyDefaultOptions = {
      multilingual: {
        phrases,
        defaultTranslation: ''
      },
      skipOverride: false
    };

    const fastify = await build(argv, emptyDefaultOptions, { logger });
    t.after(() => fastify.close());

    const fallback = {
      hi: 'hi',
      not_found: 'not_found'
    };

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'de-DE',
      }
    });
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.json(), fallback);
  });
});

test('plugin - Missing multilingual options', async t => {
  t.plan(1);

  await t.test('should handle when multilingual options are not passed', async () => {
    const options = {
      skipOverride: false
    };

    const fastify = await build(argv, options, { logger });
    t.after(() => fastify.close());

    const fallback = {
      hi: 'hi',
      not_found: 'not_found'
    };

    const response = await fastify.inject({
      method: 'GET',
      url: '/',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'accept-language': 'en',
      }
    });
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.json(), fallback);
  });
});

test('plugin - Double Registration', async t => {
  t.plan(2);

  await t.test('should handle plugin registered twice in different contexts', async () => {
    const { default: fastify } = await import('fastify');
    const app = fastify({ logger });
    t.after(() => app.close());

    // Register the plugin first time with English default
    await app.register(async function (fastify) {
      await fastify.register(import('../index.js'), {
        multilingual: {
          phrases,
          defaultTranslation: 'en'
        }
      });

      // Route in English context
      fastify.get('/en-context', async (request) => {
        return {
          hi: request.polyglot.t('hi'),
          not_found: request.polyglot.t('not_found')
        };
      });
    });

    // Register the plugin second time with Italian default
    await app.register(async function (fastify) {
      await fastify.register(import('../index.js'), {
        multilingual: {
          phrases,
          defaultTranslation: 'it'
        }
      });

      // Route in Italian context
      fastify.get('/it-context', async (request) => {
        return {
          hi: request.polyglot.t('hi'),
          not_found: request.polyglot.t('not_found')
        };
      });
    });

    await app.ready();

    // Test English context with no accept-language (should use English default)
    const enResponse = await app.inject({
      method: 'GET',
      url: '/en-context',
    });
    assert.strictEqual(enResponse.statusCode, 200);
    assert.deepStrictEqual(enResponse.json(), {
      hi: 'Hi',
      not_found: 'Page not found'
    });

    // Test Italian context with no accept-language (should use Italian default)
    const itResponse = await app.inject({
      method: 'GET',
      url: '/it-context',
    });
    assert.strictEqual(itResponse.statusCode, 200);
    assert.deepStrictEqual(itResponse.json(), {
      hi: 'Ciao',
      not_found: 'Pagina non trovata'
    });
  });

  await t.test('should handle plugin registered twice on same instance without affecting original behavior', async () => {
    const { default: fastify } = await import('fastify');
    const app = fastify({ logger });
    t.after(() => app.close());

    // Register the plugin first time with English default
    await app.register(import('../index.js'), {
      multilingual: {
        phrases,
        defaultTranslation: 'en'
      }
    });

    // Register the plugin second time with Italian default on the same instance
    await app.register(import('../index.js'), {
      multilingual: {
        phrases,
        defaultTranslation: 'it'
      }
    });

    // Add a route to test the multilingual functionality
    app.get('/test', async (request) => {
      return {
        hi: request.polyglot.t('hi'),
        not_found: request.polyglot.t('not_found')
      };
    });

    await app.ready();

    // Test that the original English behavior is preserved
    const enResponse = await app.inject({
      method: 'GET',
      url: '/test',
      headers: {
        'accept-language': 'en'
      }
    });
    assert.strictEqual(enResponse.statusCode, 200);
    assert.deepStrictEqual(enResponse.json(), {
      hi: 'Hi',
      not_found: 'Page not found'
    });

    // Test that Italian still works
    const itResponse = await app.inject({
      method: 'GET',
      url: '/test',
      headers: {
        'accept-language': 'it'
      }
    });
    assert.strictEqual(itResponse.statusCode, 200);
    assert.deepStrictEqual(itResponse.json(), {
      hi: 'Ciao',
      not_found: 'Pagina non trovata'
    });
  });
});
