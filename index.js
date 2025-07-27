import fp from 'fastify-plugin';
import fastifyMultilingual from './dist/plugin.js';

export default fp(fastifyMultilingual, {
  fastify: '5.x',
  name: 'fastify-multilingual',
});

export { fastifyMultilingual };
