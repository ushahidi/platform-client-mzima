import { Component, Input, OnInit } from '@angular/core';
import { mapHelper } from '@helpers';
import { MapConfigInterface } from '@models';
import { ConfigService } from '@services';
import {
  control,
  FitBoundsOptions,
  LatLngBounds,
  Map,
  MapOptions,
  tileLayer,
  marker,
} from 'leaflet';

@Component({
  selector: 'app-map-with-marker',
  templateUrl: './map-with-marker.component.html',
  styleUrls: ['./map-with-marker.component.scss'],
})
export class MapWithMarkerComponent implements OnInit {
  @Input() public marker: { lat: number; lon: number };

  public mapReady = false;
  public mapConfig: MapConfigInterface;
  public leafletOptions: MapOptions;
  public mapFitToBounds: LatLngBounds;
  public fitBoundsOptions: FitBoundsOptions = {
    animate: true,
  };
  public mapLayers: any[] = [];

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
          center: [this.marker.lat, this.marker.lon],
          zoom: 15,
        };

        this.mapLayers.push(
          marker({
            lat: this.marker.lat,
            lng: this.marker.lon,
          }),
        );

        this.mapReady = true;
      },
    });
  }

  public onMapReady(map: Map) {
    control.zoom({ position: 'bottomleft' }).addTo(map);
  }
}
