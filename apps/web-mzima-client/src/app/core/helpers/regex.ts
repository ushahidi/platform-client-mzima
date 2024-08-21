import XRegExp from 'xregexp';

export const emailValidate = () => {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
};

export const decimalPattern = (value: string) => {
  return /((?<!\S)[-+]?[0-9]*[.,][0-9]+$)/gm.test(value);
};

export const alphaNumeric = (value: string) => {
  const pattern = XRegExp('^[\\p{L}\\p{N}\\s\\-".?!;:,#_=*&№<>@\'()“”«»\\\\/|]*$', 'gu');
  return pattern.test(value);
};

export const urlValidate = () => {
  return '^https?://(?:[a-zA-Z0-9_-]+(?:(?:\\.[a-zA-Z0-9_-]+)+))(?:[\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?$';
};

export const phonePattern = () => {
  return '[- +()0-9]{13}';
};
