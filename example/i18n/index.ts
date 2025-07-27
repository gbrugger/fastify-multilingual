/* eslint-disable camelcase */
import { NestedPhrases } from '../../dist/plugin.js';
import { phrases as en } from './en.js';
import it from './it.js';
import { phrases as pt_BR } from './pt-BR.js';

export const phrases: NestedPhrases = {
  it: { ...it },
  en: { ...en },
  pt_BR: { ...pt_BR },
};
