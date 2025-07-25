'use strict';

import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';

import fp from 'fastify-plugin';
import Polyglot from 'node-polyglot';
import fastifyMultilingual from '../index.js';

export default fp(async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
  fastify.register(fastifyMultilingual, opts);

  fastify.get('/', async function (request:FastifyRequest, reply:FastifyReply) {
    const polyglot : Polyglot = request.polyglot();
    return reply
      .status(200)
      .send({ hi: polyglot.t('hi'), not_found: polyglot.t('not_found') });
  });
});
