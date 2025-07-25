'use strict';
import fp from 'fastify-plugin';
import fastifyMultilingual from '../index.js';
export default fp(async function (fastify, opts) {
    fastify.register(fastifyMultilingual, opts);
    fastify.get('/', async function (request, reply) {
        const polyglot = request.polyglot();
        return reply
            .status(200)
            .send({ hi: polyglot.t('hi'), not_found: polyglot.t('not_found') });
    });
});
//# sourceMappingURL=app.js.map