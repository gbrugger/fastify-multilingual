// When using fastify-cli app script with autoload, just put this file inside plugins directory

import { FastifyInstance, FastifyRegisterOptions } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import fastifyMultilingual, { MultilingualPluginOptions } from '../../index.js'; // 'fastify-multiligual'

const plugin: (fastify: FastifyInstance, opts: FastifyRegisterOptions<MultilingualPluginOptions>) => Promise<void> = fastifyPlugin(async function (fastify: FastifyInstance, opts: FastifyRegisterOptions<MultilingualPluginOptions>): Promise<void> {
  fastify.register(fastifyMultilingual, opts);
});

export default plugin;
