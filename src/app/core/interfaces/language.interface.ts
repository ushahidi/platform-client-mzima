export interface LanguageInterface {
  name: string;
  code: string;
  nplurals: number;
  pluralequation: string;
  rtl: boolean;
}

export interface TranslationInterface {
  id: string;
  name: string;
  description?: string;
}
