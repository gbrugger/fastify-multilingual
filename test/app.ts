import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import Polyglot from 'node-polyglot';
import fastifyMultilingual, { MultilingualPluginOptions } from '../index.js';

const plugin: FastifyPluginAsync<MultilingualPluginOptions> = fastifyPlugin(async function (fastify: FastifyInstance, opts: MultilingualPluginOptions) {
  fastify.register(fastifyMultilingual, opts);

  fastify.get('/', async function (request: FastifyRequest, reply: FastifyReply) {
    const polyglot : Polyglot = request.polyglot;
    return reply
      .status(200)
      .send({ hi: polyglot.t('hi'), not_found: polyglot.t('not_found') });
  });

  fastify.get('/nested', async function (request: FastifyRequest, reply: FastifyReply) {
    const polyglot : Polyglot = request.polyglot;
    return reply
      .status(200)
      .send({
        hi: polyglot.t('hi'),
        not_found: polyglot.t('not_found'),
        nested: {
          other: polyglot.t('nested.other')
        }
      });
  });
});

export default plugin;
