import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import fastifyMultilingual, { MultilingualPluginOptions, NestedPhrases } from './dist/plugin.js';

const plugin: FastifyPluginAsync<MultilingualPluginOptions> = fp(fastifyMultilingual, {
  fastify: '^5.x',
  name: 'fastify-multilingual',
});

export { MultilingualPluginOptions, NestedPhrases, plugin };
export default plugin;
