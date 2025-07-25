/* eslint-disable camelcase */
import { Dictionary } from '../../dist/plugin.js';
import { phrases as en } from './en.js';
import { phrases as es } from './es.js';
import it from './it.js';
import { phrases as pt_BR } from './pt-BR.js';

export const phrases: Dictionary = {
  it: { ...it },
  en: { ...en },
  pt_BR: { ...pt_BR },
  es: { ...es }
};
