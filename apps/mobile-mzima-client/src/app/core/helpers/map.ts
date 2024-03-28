// import { EnvService } from '@services';
import { divIcon, marker } from 'leaflet';
import { EnvService } from '../services/env.service';

export const pointIcon = (type: string = 'default', color?: string) => {
  color = color && /^[a-zA-Z0-9#]+$/.test(color) ? `#${color}` : 'var(--color-neutral-100)';
  if (type !== 'twitter' && type !== 'sms' && type !== 'email') {
    type = 'default';
  }
  const size: any = [30, 40];
  return divIcon({
    className: 'custom-map-marker',
    html: `
    <svg aria-label="Custom map marker location"  style="height: 100%; width: 100%; fill:${color};" >
      <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="assets/markers.svg#${type}"></use>
    </svg>
    `,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, 0 - size[1]],
  });
};

export const pointToLayer = (feature: any, latlng: any) => {
  return marker(latlng, {
    icon: pointIcon(feature.properties.type, feature.properties['marker-color']),
  });
};

export const mapboxStaticTiles = (name: string, mapid: string) => {
  return {
    name,
    url: 'https://api.mapbox.com/styles/v1/{mapid}/tiles/{z}/{x}/{y}?access_token={apikey}',
    layerOptions: {
      apikey: EnvService.ENV.mapbox_api_key,
      tileSize: 512,
      maxZoom: 18,
      zoomOffset: -1,
      mapid: mapid,
      attribution:
        '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> <strong><a href="https://www.mapbox.com/map-feedback/" target="_blank">Improve this map</a></strong>',
    },
  };
};

export const getMapLayers = () => {
  return {
    baselayers: {
      satellite: mapboxStaticTiles('Satellite', 'mapbox/satellite-v9'),
      MapQuestAerial: mapboxStaticTiles('Satellite', 'mapbox/satellite-v9'),
      streets: mapboxStaticTiles('Streets', 'mapbox/streets-v11'),
      MapQuest: mapboxStaticTiles('Streets', 'mapbox/streets-v11'),
      hOSM: {
        name: 'Humanitarian',
        url: '//{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
        layerOptions: {
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>, &copy; <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap</a> | <a href="https://www.mapbox.com/feedback/" target="_blank">Improve the underlying map</a>',
        },
      },
      dark: mapboxStaticTiles('Dark', 'mapbox/dark-v10'),
    },
  };
};

export const getMapLayer = (baseLayer: string, isDarkMode: boolean) => {
  return (getMapLayers() as any).baselayers[
    isDarkMode &&
    baseLayer !== 'satellite' &&
    baseLayer !== 'MapQuestAerial' &&
    baseLayer !== 'hOSM'
      ? 'dark'
      : baseLayer
  ];
};
