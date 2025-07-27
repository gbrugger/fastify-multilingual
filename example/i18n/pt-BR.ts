import { NestedPhrases } from '../../dist/plugin.js'; // fastify-multilingual

export const phrases: NestedPhrases = {
  greeting: {
    hi: 'Olá',
  },
  404: {
    not_found: 'Página não encontrada',
  },
  other: 'Não aninhado',
};
