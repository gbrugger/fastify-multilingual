// When using fastify-cli app script with autoload, just put this file inside plugins directory

import { FastifyInstance, FastifyPluginOptions } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import fastifyMultilingual from '../../index.js'; // 'fastify-multiligual'

const plugin: (fastify: FastifyInstance, opts: FastifyPluginOptions) => Promise<void> = fastifyPlugin(async function (fastify: FastifyInstance, opts: FastifyPluginOptions): Promise<void> {
  fastify.register(fastifyMultilingual, opts);
});

export default plugin;
