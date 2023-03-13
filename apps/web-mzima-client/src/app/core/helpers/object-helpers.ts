export const objectsCompare = (object1: object, object2: object) => {
  return (
    JSON.stringify(Object.entries(object1).sort()) ===
    JSON.stringify(Object.entries(object2).sort())
  );
};
