import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { LatLon, MapConfigInterface } from '@models';
import { Map, MapOptions, marker, tileLayer } from 'leaflet';
import { SessionService } from '@services';
import { mapHelper } from '@helpers';

@Component({
  selector: 'app-location-control',
  templateUrl: './location-control.component.html',
  styleUrls: ['./location-control.component.scss'],
})
export class LocationControlComponent implements OnInit, AfterViewInit {
  @Input() public location: LatLon;
  public type = 'default';
  public map: Map;
  public mapConfig: MapConfigInterface;
  public leafletOptions: MapOptions;
  public mapLayers: any[] = [];
  private isDarkMode = false;
  public isMapReady = false;
  private baseLayer: 'streets' | 'satellite' | 'hOSM' | 'MapQuestAerial' | 'MapQuest' | 'dark';

  constructor(private sessionService: SessionService) {
    const mediaDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    mediaDarkMode.addEventListener('change', (ev) => this.switchMode(ev));
    this.isDarkMode = mediaDarkMode.matches;
  }

  ngOnInit(): void {
    this.sessionService.mapConfig$.subscribe({
      next: (mapConfig) => {
        if (mapConfig) {
          this.mapConfig = mapConfig;

          this.baseLayer = this.mapConfig.default_view!.baselayer;
          const currentLayer = mapHelper.getMapLayer(this.baseLayer, this.isDarkMode);

          this.leafletOptions = {
            minZoom: 10,
            maxZoom: 20,
            scrollWheelZoom: true,
            zoomControl: false,
            layers: [tileLayer(currentLayer.url, currentLayer.layerOptions)],
            center: [this.location.lat, this.location.lon],
            zoom: 15,
          };
        }
      },
    });

    const mapMarker = marker(
      {
        lat: this.location.lat,
        lng: this.location.lon,
      },
      {
        icon: mapHelper.pointIcon('default'),
      },
    );
    this.mapLayers.push(mapMarker);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isMapReady = true;
    }, 200);
  }

  private switchMode(systemInitiatedDark: any) {
    this.isDarkMode = systemInitiatedDark.matches;

    const currentLayer = mapHelper.getMapLayer(this.baseLayer, this.isDarkMode);

    this.leafletOptions.layers = [tileLayer(currentLayer.url, currentLayer.layerOptions)];

    this.isMapReady = false;
    setTimeout(() => {
      this.isMapReady = true;
    }, 50);
  }

  public onMapReady(map: Map) {
    this.map = map;
  }
}
