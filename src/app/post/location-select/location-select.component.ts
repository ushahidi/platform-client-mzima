import { Component, OnInit } from '@angular/core';
import { mapHelper } from '@helpers';
import { GeoJsonPostsResponse, MapConfigInterface } from '@models';
import { SessionService } from '@services';
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

  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.mapConfig = this.sessionService.getMapConfigurations();

    const currentLayer =
      mapHelper.getMapLayers().baselayers[this.mapConfig.default_view!.baselayer];

    this.leafletOptions = {
      scrollWheelZoom: true,
      zoomControl: false,
      layers: [tileLayer(currentLayer.url, currentLayer.layerOptions)],
      center: [this.mapConfig.default_view!.lat, this.mapConfig.default_view!.lon],
      zoom: this.mapConfig.default_view!.zoom,
    };
    this.markerClusterOptions.maxClusterRadius = this.mapConfig.cluster_radius;

    this.mapReady = true;
  }

  onMapReady(map: Map) {
    control.zoom({ position: 'bottomleft' }).addTo(map);
  }
}
