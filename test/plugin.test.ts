import { build } from 'fastify-cli/helper.js';
import assert from 'node:assert';
import { test } from 'node:test';
import { phrases } from './i18n/index.js';

// Node.js test runner adds exit listeners on t.after(() => fastify.close()). The default of 10 is not enough.
process.setMaxListeners(0);

const logger = {
  transport: {
    target: 'pino-pretty',
    options: {
      destination: 2,
    },
  },
};
const argv = ['test/app.js'];

test('plugin  - cases with default Locale', async t => {
  t.plan(5);

  const options = {
    multilingual: {
      phrases,
      defaultLocale: 'en'
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
      defaultLocale: 'en'
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

test('plugin - Configuration Edge Cases', async t => {
  t.plan(2);

  await t.test('should handle empty phrases object', async () => {
    const emptyOptions = {
      multilingual: {
        phrases: {},
        defaultLocale: 'en'
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

  await t.test('should handle defaultLocale as empty string', async () => {
    const emptyDefaultOptions = {
      multilingual: {
        phrases,
        defaultLocale: ''
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
