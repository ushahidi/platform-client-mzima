export const emailValidate = () => {
  return '^(([a-zA-Z\\-0-9_]+(\\.[a-zA-Z\\-0-9_]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$';
};

export const decimalPattern = (value: string) => {
  return /((?<!\S)[-+]?[0-9]*[.,][0-9]+$)/gm.test(value);
};
