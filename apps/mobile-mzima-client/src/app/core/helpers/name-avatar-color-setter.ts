export function NameAvatarColorSetter(name: string) {
  const R_OF_RGB_CHARCODE = name.charCodeAt(0);
  const G_OF_RGB_CHARCODE = name.charCodeAt(1) || R_OF_RGB_CHARCODE;

  const generateColor = (charCode: number) => Math.pow(charCode, 7) % 200;
  const red = generateColor(R_OF_RGB_CHARCODE);
  const green = generateColor(G_OF_RGB_CHARCODE);
  const blue = generateColor(red + green);

  return `rgb(${red}, ${green}, ${blue})`;
}
