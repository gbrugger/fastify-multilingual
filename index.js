import fp from 'fastify-plugin';
import fastifyMultilingual from './dist/plugin.js';
const plugin = fp(fastifyMultilingual, {
    fastify: '^5.x',
    name: 'fastify-multilingual',
});
export { plugin };
export default plugin;
//# sourceMappingURL=index.js.map