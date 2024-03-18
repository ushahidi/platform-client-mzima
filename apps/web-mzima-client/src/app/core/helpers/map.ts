// import { EnvService } from '@services';
import { divIcon, marker } from 'leaflet';
import { EnvService } from '../services/env.service';

export const pointIcon = (color: string, type: string = 'default') => {
  // Test string to make sure that it does not contain injection
  color = color && /^[a-zA-Z0-9#]+$/.test(color) ? `#${color}` : 'var(--color-neutral-100)';
  const size: any = [30, 40];
  // var iconicSprite = require('ushahidi-platform-pattern-library/assets/img/iconic-sprite.svg');

  return divIcon({
    className: 'custom-map-marker',
    html: `
    <svg class="iconic" style="height: 100%; width: 100%; fill:${color};" aria-label="Map leaflet icon">
      <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="assets/markers.svg#${type}"></use>
    </svg>
    <span class="iconic-bg" style="background-color:${color};"></span>
    `,
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

export const mapboxStaticTiles = (name: string, mapid: string, code: string, visible = true) => {
  return {
    name,
    url: 'https://api.mapbox.com/styles/v1/{mapid}/tiles/{z}/{x}/{y}?access_token={apikey}',
    layerOptions: {
      apikey: EnvService.ENV.mapbox_api_key,
      tileSize: 512,
      maxZoom: 22, // "Default zoom level" input field in general settings
      zoomOffset: -1,
      mapid: mapid,
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    },
    visible,
    code,
  };
};

export const getMapLayers = () => {
  return {
    baselayers: {
      satellite: mapboxStaticTiles('Satellite', 'mapbox/satellite-v9', 'satellite'),
      MapQuestAerial: mapboxStaticTiles(
        'Satellite',
        'mapbox/satellite-v9',
        'MapQuestAerial',
        false,
      ),
      streets: mapboxStaticTiles('Streets', 'mapbox/streets-v11', 'streets'),
      MapQuest: mapboxStaticTiles('Streets', 'mapbox/streets-v11', 'MapQuest', false),
      hOSM: {
        name: 'Humanitarian',
        url: '//{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        layerOptions: {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>, &copy; <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap</a> | <a href="https://www.mapbox.com/feedback/" target="_blank">Improve the underlying map</a>',
        },
        visible: true,
        code: 'hOSM',
      },
    },
  };
};
