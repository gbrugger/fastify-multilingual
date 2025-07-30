// When using fastify-cli app script with autoload, just put this file inside plugins directory

import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

export const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get('/', async function (request:FastifyRequest, reply:FastifyReply) {
    const { polyglot } = request;

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
    const { polyglot } = request;

    return reply
      .status(404)
      .send({
        404: {
          not_found: polyglot.t('404.not_found'),
        }
      });
  });
};

export default routes;
