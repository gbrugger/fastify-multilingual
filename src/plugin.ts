import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import Polyglot from 'node-polyglot';
import { findLocale } from './util.js';

type PolyglotGetter = () => Polyglot;
type Dictionary = Record<string, Record<string, string>>;

declare module 'fastify' {
  interface FastifyRequest {
    availableLocales: string;
    polyglot: PolyglotGetter;
    [key: `polyglot-${string}`]: PolyglotGetter;
  }
}

interface MultilingualPluginOptions extends FastifyPluginOptions {
  multilingual : {
    phrases: Dictionary;
    defaultLocale: string | null;
  }
}

// @TODO:
// Warning for options unset
// Write examples in @example/ folder
// Write README.md with fastify-cli
// Setup CI with Github Actions

const fastifyMultilingual = async (fastify: FastifyInstance, options: MultilingualPluginOptions) => {
  // Load dictionaries from the specified directory
  const phrases = options.multilingual.phrases;

  // Empty, ultimate fallback instance (returns keys as messages)
  const polyglot = new Polyglot({ phrases: {} as Dictionary });

  if (!fastify.hasReplyDecorator('polyglot')) {
    fastify.decorateRequest('polyglot', () => polyglot);
  }

  const availableLocales = Object.keys(phrases)
    .map((key) => key.replace('_', '-'))
    .join(',');
  fastify.decorateRequest('availableLocales', availableLocales);

  Object.entries(phrases).forEach(([localeKey, phrases]) => {
    const locale = localeKey.replace('_', '-');
    if (!fastify.hasReplyDecorator(`polyglot-${locale}`)) {
      const polyglot = new Polyglot({
        phrases,
        locale,
      });
      fastify.decorateRequest(`polyglot-${locale}`, () => polyglot);
    }
  });

  // Pick the right Polyglot instance for each request, based on the Accept-Language header
  fastify.addHook('onRequest', async (request: FastifyRequest) => {
    const availableLocales = request.availableLocales.split(',').filter(locale => locale.length > 0);

    if (availableLocales.length > 0) {
      const acceptLanguage = request.headers['accept-language'];

      let polyglotLocale: string | null = null;

      if (acceptLanguage) {
        // Parse Accept-Language header in order of appearance, without quality factors
        const preferredLocales = acceptLanguage
          .split(',')
          .map((lang:string) => lang.split(';')[0]?.trim())
          .filter((locale): locale is string => locale !== undefined);

        // The locales must be searched in the order of preference,
        // but the returned locale must the one that matches the preferred locale from the available ones.
        polyglotLocale =
          findLocale(preferredLocales, availableLocales);
      }
      polyglotLocale = polyglotLocale || options.multilingual.defaultLocale;

      // Appends the Polyglot object found to this request, else keeps the fallback.
      if (polyglotLocale) {
        const polyglotGetter = request.getDecorator<PolyglotGetter | null>(`polyglot-${polyglotLocale}`);
        if (polyglotGetter) {
          // request.polyglot = polyglotGetter;
          request.setDecorator<PolyglotGetter>('polyglot', polyglotGetter);
        }
      }
    }
  });
};

export type { Dictionary };

export default fastifyMultilingual;
export { fastifyMultilingual };
