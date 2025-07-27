import { FastifyInstance, FastifyPluginOptions, FastifyRequest } from 'fastify';
import Polyglot from 'node-polyglot';
import pkg from 'process-warning';
import { findLocale } from './util.js';

const { createWarning } = pkg;

type PolyglotGetter = () => Polyglot;

type NestedPhrases = {
  [key: string]: string | NestedPhrases;
};

declare module 'fastify' {
  interface FastifyRequest {
    availableLocales: string;
    polyglot: PolyglotGetter;
    [key: `polyglot-${string}`]: PolyglotGetter;
  }
}

interface MultilingualPluginOptions extends FastifyPluginOptions {
  multilingual : {
    phrases: NestedPhrases;
    defaultLocale: string | null;
  }
}

// @TODO:
// Write examples in @example/ folder
// fix index.js
// fix tsconfig.json to separate test compilations
// Write README.md with fastify-cli
// Setup CI with Github Actions

const fastifyMultilingual = async (fastify: FastifyInstance, options: MultilingualPluginOptions): Promise<void> => {
  // Empty, ultimate fallback instance (returns keys as messages)
  const polyglot = new Polyglot({ phrases: {} as NestedPhrases });

  if (!fastify.hasRequestDecorator('polyglot')) {
    fastify.decorateRequest('polyglot', () => polyglot);
  }

  // Load dictionaries from the specified directory
  const phrases = options.multilingual.phrases;

  if (Object.keys(phrases).length === 0) {
    const warning = createWarning({
      name: 'FastifyMultilingualNoPhrases',
      code: 'FST_ML_WARN_NO_PHRASES',
      message: 'No phrases provided to fastify-multilingual. Will return keys.'
    });
    warning();
  }

  const availableLocales = Object.keys(phrases)
    .map((key) => key.replace('_', '-'))
    .join(',');
  if (!fastify.hasRequestDecorator('availableLocales')) {
    fastify.decorateRequest('availableLocales', availableLocales);
  }

  Object.entries(phrases).forEach(([localeKey, phrases]) => {
    const locale = localeKey.replace('_', '-');
    if (!fastify.hasRequestDecorator(`polyglot-${locale}`)) {
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

export type { NestedPhrases };

export default fastifyMultilingual;
export { fastifyMultilingual };
