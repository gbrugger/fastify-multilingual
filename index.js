import fp from 'fastify-plugin';
import fastifyMultilingual, { NestedPhrases } from './dist/plugin.js';

export default fp(fastifyMultilingual, {
  fastify: '5.x',
  name: 'fastify-multilingual',
});

export { fastifyMultilingual, NestedPhrases };
