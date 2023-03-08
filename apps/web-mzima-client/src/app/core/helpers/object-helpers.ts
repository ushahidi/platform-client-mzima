export const objectsCompare = (object1: Object, object2: Object) => {
  return (
    JSON.stringify(Object.entries(object1).sort()) ===
    JSON.stringify(Object.entries(object2).sort())
  );
};
