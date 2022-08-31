export interface Language {
  name: string;
  code: string;
  nplurals: number;
  pluralequation: string;
  rtl: boolean;
}

export interface Translation {
  id: string;
  name: string;
  description?: string;
}
