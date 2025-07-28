import { FastifyInstance } from 'fastify';
import { MultilingualPluginOptions, NestedPhrases } from './dist/plugin.js';
declare const plugin: (fastify: FastifyInstance, options: MultilingualPluginOptions) => Promise<void>;
export { MultilingualPluginOptions, NestedPhrases, plugin };
export default plugin;
//# sourceMappingURL=index.d.ts.map