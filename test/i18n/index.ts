/* eslint-disable camelcase */
import { NestedPhrases } from '../../index.js';
import { phrases as en_GB } from './en-GB.js';
import { phrases as en } from './en.js';
import { phrases as es } from './es.js';
import it from './it.js';
import { phrases as pt_BR } from './pt-BR.js';

export const phrases: NestedPhrases = {
  it: { ...it },
  en: { ...en },
  en_GB: { ...en_GB },
  pt_BR: { ...pt_BR },
  es: { ...es }
};
