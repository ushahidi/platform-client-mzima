export const sortArray = (array: any[], field = 'id') => {
  return array.sort((a, b) => (a[field] > b[field] ? 1 : b[field] > a[field] ? -1 : 0));
};
