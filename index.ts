import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import fastifyMultilingual, { MultilingualPluginOptions, NestedPhrases } from './dist/plugin.js';

const plugin: (fastify: FastifyInstance, options: MultilingualPluginOptions) => Promise<void> = fp(fastifyMultilingual, {
  fastify: '^5.x',
  name: 'fastify-multilingual',
});

export { MultilingualPluginOptions, NestedPhrases, plugin };
export default plugin;
