// When using fastify-cli app script with autoload, just put this file inside plugins directory

import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from 'fastify';

import Polyglot from 'node-polyglot';
import fastifyMultilingual from '../../index.js'; // 'fastify-multiligual'

export default async (fastify: FastifyInstance, opts: FastifyPluginOptions):Promise<void> => {
  fastify.register(fastifyMultilingual, opts);

  // Routes can also be registered in its own file(s)
  fastify.get('/', async function (request:FastifyRequest, reply:FastifyReply) {
    const polyglot : Polyglot = request.polyglot();
    return reply
      .status(200)
      .send({
        greeting: {
          hi: polyglot.t('greeting.hi'),
        },
        other: polyglot.t('other')
      });
  });

  fastify.get('/404', async function (request:FastifyRequest, reply:FastifyReply) {
    const polyglot : Polyglot = request.polyglot();
    return reply
      .status(404)
      .send({
        404: {
          not_found: polyglot.t('404.not_found'),
        }
      });
  });
};
