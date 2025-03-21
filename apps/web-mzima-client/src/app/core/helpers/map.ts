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
    <svg class="iconic" style="height: 100%; width: 100%; fill:${color};">
      <use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="assets/markers.svg#${type}"></use>
    </svg>
    <span class="iconic-bg" style="background-color:${color};"></span>
    `,
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
    popupAnchor: [0, 0 - size[1]],
  });
};

export const imageIcon = (color: string) => {
  // Test string to make sure that it does not contain injection
  color = color && /^[a-zA-Z0-9#]+$/.test(color) ? `#${color}` : 'var(--color-neutral-100)';

  const svg = `
    <svg width="50" height="50" viewBox="0 0 56 56" fill="${color}" xmlns="http://www.w3.org/2000/svg">
      <path id="Vector" d="M27.9998 4.66699C18.9698 4.66699 11.6665 11.9703 11.6665 21.0003C11.6665 30.7303 21.9798 44.147 26.2265 49.257C27.1598 50.377 28.8632 50.377 29.7965 49.257C34.0198 44.147 44.3332 30.7303 44.3332 21.0003C44.3332 11.9703 37.0298 4.66699 27.9998 4.66699ZM27.9998 26.8337C24.7798 26.8337 22.1665 24.2203 22.1665 21.0003C22.1665 17.7803 24.7798 15.167 27.9998 15.167C31.2198 15.167 33.8332 17.7803 33.8332 21.0003C33.8332 24.2203 31.2198 26.8337 27.9998 26.8337Z" fill="${color}"/>
      <clipPath id="clip0_9461_121463"></clipPath>
    </svg>
  `;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

export const pointToLayer = (feature: any, latlng: any) => {
  return marker(latlng, {
    icon: pointIcon(feature.properties['marker-color']),
  });
};

export const mapboxStaticTiles = (name: string, mapid: string, code: string, visible = true) => {
  return {
    name,
    url: `https://api.mapbox.com/styles/v1/${mapid}/tiles/{z}/{x}/{y}?access_token=${EnvService.ENV.mapbox_api_key}`,
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
export const getOpenLayersMapConfig = () => {
  return [
    mapboxStaticTiles('Satellite', 'mapbox/satellite-v9', 'satellite'),
    mapboxStaticTiles('Satellite', 'mapbox/satellite-v9', 'MapQuestAerial', false),
    mapboxStaticTiles('Streets', 'mapbox/streets-v11', 'streets'),
    mapboxStaticTiles('Streets', 'mapbox/streets-v11', 'MapQuest', false),
    {
      name: 'Humanitarian',
      url: '//{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      layerOptions: {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>, &copy; <a href="http://hot.openstreetmap.org/">Humanitarian OpenStreetMap</a> | <a href="https://www.mapbox.com/feedback/" target="_blank">Improve the underlying map</a>',
      },
      visible: true,
      code: 'hOSM',
    },
  ];
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

interface WaterLayerParams {
  LAYERS: string;
  FORMAT: string;
  TRANSPARENT: boolean;
  TIME: string;
  CRS: string;
  exceptions: string;
  styles: string;
}

interface WaterLayer {
  name: string;
  attribution: string;
  url: string;
  params: WaterLayerParams;
}

export const getWaterLayer = (): WaterLayer[] => {
  const createWaterLayer = (name: string, time: string): WaterLayer => ({
    name,
    url: 'https://ows.digitalearth.africa/wms?version=1.3.0',
    attribution:
      '<br><br><strong>Water Observations from Space (WOfS)</strong> is a service that uses satellite images to provide historical surface water observations across the African continent. WOfS enables users to understand the location and movement of inland and coastal water over time. It shows where water is usually present; where it is seldom observed; and where inundation of the surface has been observed by satellite. The product used is accessible through <a href="https://ows.digitalearth.africa/" target="_blank">OGC Web Service</a>. For more information, see the <a href="https://docs.digitalearthafrica.org/en/latest/data_specs/Landsat_WOfS_specs.html" target="_blank">Digital Earth Africa User Guide.</a>',
    params: {
      LAYERS: 'wofs_ls_summary_annual',
      FORMAT: 'image/png',
      TRANSPARENT: true,
      TIME: time,
      CRS: 'EPSG:3857',
      exceptions: 'XML',
      styles: 'wofs_summary_annual_frequency',
    },
  });

  return [
    createWaterLayer('Water Observations from space 2023', '2023-01-01'),
    createWaterLayer('Water Observations from space 2013', '2013-01-01'),
  ];
};

interface RainfallLayer {
  name: string;
  attribution: string;
  url: string;
  params: {
    LAYERS: string;
    FORMAT: string;
    TRANSPARENT: boolean;
    TIME: string;
    CRS: string;
    exceptions: string;
    styles: string;
  };
}

export const getRainfallLayer = (): RainfallLayer[] => {
  const createRainfallLayer = (name: string, time: string): RainfallLayer => ({
    name,
    url: 'https://ows.digitalearth.africa/wms?version=1.3.0',
    attribution:
      '<br><br><strong>CHIRPS</strong> is a <strong>USGS and Climate Hazards Centre</strong> initiative with funding from <strong>USAID, NASA, and NOAA</strong>. Find out more on the <a href="https://www.chc.ucsb.edu/data/chirps." target="_blank">CHIRPS website</a>',
    params: {
      LAYERS: 'rainfall_chirps_monthly',
      FORMAT: 'image/png',
      TRANSPARENT: true,
      TIME: time,
      CRS: 'EPSG:3857',
      exceptions: 'XML',
      styles: 'rainfall_monthly',
    },
  });

  const years = [1981, 1986, 1991, 1996, 2001, 2006, 2011, 2016, 2021, 2024, 2025];
  return years.map((year) => createRainfallLayer(`Rainfall January ${year}`, `${year}-01-01`));
};
