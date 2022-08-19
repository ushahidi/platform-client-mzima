import { divIcon, marker } from 'leaflet';

export const pointIcon = (color: string, size?: any, className?: string) => {
  // Test string to make sure that it does not contain injection
  color = color && /^[a-zA-Z0-9#]+$/.test(color) ? color : '#959595';
  size = size || [32, 32];
  // var iconicSprite = require('ushahidi-platform-pattern-library/assets/img/iconic-sprite.svg');

  return divIcon({
    className: 'custom-map-marker ' + className,
    // html: '<svg class="iconic" style="fill:' + color + ';"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="' + iconicSprite + '#map-marker"></use></svg><span class="iconic-bg" style="background-color:' + color + ';""></span>',
    html:
      '<svg class="iconic" style="height: 100%; width: 100%; fill:' +
      color +
      ';"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#map-marker"></use></svg><span class="iconic-bg" style="background-color:' +
      color +
      ';""></span>',
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, 0 - size[1]],
  });
};

export const pointToLayer = (feature: any, latlng: any) => {
  return marker(latlng, {
    icon: pointIcon(feature.properties['marker-color']),
  });
};
