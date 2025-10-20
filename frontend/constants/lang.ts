export enum Lang {
  EN = 'en',
  HE = 'he'
}

export const DEFAULT_LANG = (process.env.NEXT_PUBLIC_DEFAULT_LANG as Lang) || Lang.HE;
