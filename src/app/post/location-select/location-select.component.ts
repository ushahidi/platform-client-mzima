import { Component, OnInit } from '@angular/core';
import { mapHelper } from '@helpers';
import { GeoJsonPostsResponse, MapConfigInterface } from '@models';
import { ConfigService } from '@services';
import {
  control,
  FitBoundsOptions,
  LatLngBounds,
  Map,
  MapOptions,
  MarkerClusterGroup,
  MarkerClusterGroupOptions,
  tileLayer,
} from 'leaflet';

@Component({
  selector: 'app-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss'],
})
export class LocationSelectComponent implements OnInit {
  postsCollection: GeoJsonPostsResponse;
  mapLayers: any[] = [];
  mapReady = false;
  mapConfig: MapConfigInterface;
  markerClusterData = new MarkerClusterGroup();
  markerClusterOptions: MarkerClusterGroupOptions = { animate: true, maxClusterRadius: 50 };
  mapFitToBounds: LatLngBounds;
  fitBoundsOptions: FitBoundsOptions = {
    animate: true,
  };

  public leafletOptions: MapOptions;

  constructor(private configService: ConfigService) {}

  ngOnInit(): void {
    this.configService.getMap().subscribe({
      next: (mapConfig) => {
        this.mapConfig = mapConfig;

        const currentLayer = mapHelper.getMapLayers().baselayers[mapConfig.default_view.baselayer];

        this.leafletOptions = {
          scrollWheelZoom: true,
          zoomControl: false,
          layers: [tileLayer(currentLayer.url, currentLayer.layerOptions)],
          center: [mapConfig.default_view.lat, mapConfig.default_view.lon],
          zoom: mapConfig.default_view.zoom,
        };
        this.markerClusterOptions.maxClusterRadius = mapConfig.cluster_radius;

        this.mapReady = true;
      },
    });
  }

  onMapReady(map: Map) {
    control.zoom({ position: 'bottomleft' }).addTo(map);
  }
}
