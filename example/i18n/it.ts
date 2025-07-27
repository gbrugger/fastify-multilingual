import { NestedPhrases } from '../../dist/plugin.js'; // fastify-multilingual

// Default export
const phrases: NestedPhrases = {
  greeting: {
    hi: 'Ciao',
  },
  404: {
    not_found: 'Pagina non trovata',
  }
};

export default phrases;
