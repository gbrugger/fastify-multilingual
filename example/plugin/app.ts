// This whole file can be substituted by fastify-cli app script with autoload
// Just remember to set the options correctly

// Run with 'npm run example'
// Run 'npm run example:get' to see the results with all available phrases and the default when not found (de -> en)

import fastify from 'fastify';
import { phrases } from '../i18n/index.js';
import fastifyMultilingual from './plugin.js';
import routes from './routes.js';

const app = fastify({
  logger: {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  }
});

const options = {
  multilingual: {
    phrases,
    defaultLocale: 'en'
  },
};

app.register(fastifyMultilingual, options);

app.register(routes, options);

app.listen({ port: 3000 }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
