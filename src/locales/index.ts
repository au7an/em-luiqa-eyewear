import { id } from './id';
import { en } from './en';

export type Language = 'id' | 'en';
export type LocaleDict = typeof id;

export const dictionaries: Record<Language, LocaleDict> = {
  id,
  en,
};

export { id, en };
