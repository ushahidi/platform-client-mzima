import XRegExp from 'xregexp';

export const emailValidate = () => {
  return '^(([a-zA-Z\\-0-9_]+(\\.[a-zA-Z\\-0-9_]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';
};

export const alphaNumeric = (value: string) => {
  const pattern = XRegExp('^[\\p{L}\\p{N}\\s\\-".?!;,@\'()“”«»]*$', 'gu');
  return pattern.test(value);
};
