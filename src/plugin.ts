import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions, FastifyRequest } from 'fastify';
import Polyglot from 'node-polyglot';
import pkg from 'process-warning';
import { findLocale } from './util.js';

const { createWarning } = pkg;

// type PolyglotGetter = () => Polyglot;

type NestedPhrases = {
  [key: string]: string | NestedPhrases;
};

declare module 'fastify' {
  interface FastifyRequest {
    availableTranslations: string;
    currentTranslation: string,
    _polyglot: Polyglot;
    polyglot: Polyglot;
    [key: `polyglot-${string}`]: Polyglot;
  }
}

interface MultilingualPluginOptions extends FastifyPluginOptions {
  multilingual : {
    phrases: NestedPhrases;
    defaultTranslation: string | null;
  }
}

const fastifyMultilingual: FastifyPluginAsync<MultilingualPluginOptions> = async function (fastify: FastifyInstance, options: MultilingualPluginOptions): Promise<void> {
  if (!fastify.hasRequestDecorator('currentTranslation')) {
    fastify.decorateRequest('currentTranslation', '');
  }

  // Empty, ultimate fallback instance (returns keys as messages)
  const _polyglot = new Polyglot({ phrases: {} as NestedPhrases });

  if (!fastify.hasRequestDecorator('_polyglot')) {
    fastify.decorateRequest('_polyglot', {
      getter () {
        return _polyglot;
      }
    });
  }

  // Load dictionaries from the specified directory
  const phrases = options?.multilingual?.phrases || {};

  if (Object.keys(phrases).length === 0) {
    const warning = createWarning({
      name: 'FastifyMultilingualNoPhrases',
      code: 'FST_ML_WARN_NO_PHRASES',
      message: 'No phrases provided to fastify-multilingual. Will return keys.'
    });
    warning();
  }

  const availableTranslations = Object.keys(phrases)
    .map((key) => key.replace('_', '-'))
    .join(',');
  if (!fastify.hasRequestDecorator('availableTranslations')) {
    fastify.decorateRequest('availableTranslations', availableTranslations);
  }

  Object.entries(phrases).forEach(([localeKey, phrases]) => {
    const locale = localeKey.replace('_', '-');
    if (!fastify.hasRequestDecorator(`polyglot-${locale}`)) {
      const polyglotWithLocale = new Polyglot({
        phrases,
        locale,
      });
      fastify.decorateRequest(`polyglot-${locale}`, {
        getter () {
          return polyglotWithLocale;
        }
      });
    }
  });

  if (!fastify.hasRequestDecorator('polyglot')) {
    fastify.decorateRequest('polyglot', {
      getter () {
        if (this.currentTranslation) {
          const polyglot = this.getDecorator<Polyglot | null>(`polyglot-${this.currentTranslation}`);
          if (polyglot) {
            return polyglot;
          }
        }
        return this._polyglot;
      }
    });
  }

  // Pick the right Polyglot translation for each request, based on the Accept-Language header
  fastify.addHook('onRequest', async function (request: FastifyRequest) {
    const availableTranslations = request.availableTranslations.split(',').filter(locale => locale.length > 0);

    if (availableTranslations.length > 0) {
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
          findLocale(preferredLocales, availableTranslations);
      }
      polyglotLocale = polyglotLocale || options?.multilingual?.defaultTranslation;

      // Appends the translation found to this request, else keeps the fallback.
      if (polyglotLocale) {
        request.currentTranslation = polyglotLocale;
      }
    }
  });
};

export type { NestedPhrases };

export default fastifyMultilingual;
export { fastifyMultilingual, MultilingualPluginOptions };
