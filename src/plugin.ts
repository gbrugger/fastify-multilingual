import { FastifyInstance, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import Polyglot from 'node-polyglot';
import { findLocale, loadDictionaries } from './util.js';

declare module 'fastify' {
  interface FastifyRequest {
    availableLocales: string;
    polyglot: () => Polyglot;
    [key: `polyglot-${string}`]: () => Polyglot;
  }
}

interface PluginOptions {
  dictionaryPath: string;
  defaultLocale: string;
}

const fastifyPolyglot = async (fastify: FastifyInstance, options: PluginOptions) => {
  // Load dictionaries from the specified directory
  const messages = await loadDictionaries(options.dictionaryPath);
  // Empty, ultimate fallback instance (returns keys as messages)
  const polyglot = new Polyglot({ phrases: {} });
  fastify.decorateRequest('polyglot', () => polyglot);

  const availableLocales = Object.keys(messages)
    .map((key) => key.replace('_', '-'))
    .join();
  fastify.decorateRequest('availableLocales', availableLocales);

  Object.entries(messages).forEach(([locale, phrases]) => {
    const localeKey = locale.replace('_', '-');
    const polyglot = new Polyglot({
      phrases,
      locale: localeKey,
    });
    fastify.decorateRequest(`polyglot-${localeKey}`, () => polyglot);
  });

  // Pick the right Polyglot instance based on the Accept-Language header
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    const availableLocales = request.availableLocales.split(',');

    if (availableLocales.length > 0) {
      const acceptLanguage = request.headers['accept-language'];

      if (acceptLanguage) {
        // Parse Accept-Language header in order of appearance, without quality factors
        const preferredLocales = acceptLanguage
          .split(',')
          .map((lang:string) => lang.split(';')[0]?.trim())
          .filter((locale): locale is string => locale !== undefined);

        // The locales must be searched in the order of preference,
        // but the returned locale must the one that matches the preferred locale from the available ones.
        const polyglotLocale =
          findLocale(preferredLocales, availableLocales) ||
          options.defaultLocale ||
          availableLocales[0];

        // Appends any Polyglot object found to this request, else keeps the fallback.
        const polyglotGetter = request[`polyglot-${polyglotLocale}`];
        if (polyglotGetter) {
          request.polyglot = polyglotGetter;
        }
      }
    }
  });
};

export default fp(fastifyPolyglot, {
  fastify: '5.x',
  name: 'fastify-polyglot',
});

export { fastifyPolyglot };
