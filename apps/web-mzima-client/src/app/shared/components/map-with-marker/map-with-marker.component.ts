import { Component, Input, NgZone, OnInit } from '@angular/core';
import { mapHelper } from '@helpers';
import { MapConfigInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import {
  control,
  FitBoundsOptions,
  LatLngBounds,
  Map,
  MapOptions,
  tileLayer,
  marker,
} from 'leaflet';
import { pointIcon } from '../../../core/helpers/map';
import { NotificationService } from '../../../core/services/notification.service';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-map-with-marker',
  templateUrl: './map-with-marker.component.html',
  styleUrls: ['./map-with-marker.component.scss'],
})
export class MapWithMarkerComponent implements OnInit {
  @Input() public marker: { lat: number; lon: number };
  @Input() public color = 'var(--color-neutral-100)';
  @Input() public type = 'default';

  public mapReady = false;
  public mapConfig: MapConfigInterface;
  public leafletOptions: MapOptions;
  public mapFitToBounds: LatLngBounds;
  public fitBoundsOptions: FitBoundsOptions = {
    animate: true,
  };
  public mapLayers: any[] = [];
  private map: Map;

  constructor(
    private sessionService: SessionService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private zone: NgZone,
  ) {}

  ngOnInit(): void {
    this.mapConfig = this.sessionService.getMapConfigurations();

    const currentLayer =
      mapHelper.getMapLayers().baselayers[this.mapConfig.default_view!.baselayer];
    const baseTileLayer = mapHelper.attachTileFallback(
      tileLayer(currentLayer.url, currentLayer.layerOptions),
      currentLayer.code,
      this.zone,
      (fallbackLayer) => {
        this.map.removeLayer(baseTileLayer);
        this.map.addLayer(fallbackLayer);
        this.notificationService.showError(this.translate.instant('notify.map.baselayer_fallback'));
      },
    );

    this.leafletOptions = {
      scrollWheelZoom: true,
      zoomControl: false,
      layers: [baseTileLayer],
      center: [this.marker.lat, this.marker.lon],
      zoom: this.mapConfig.default_view!.zoom,
    };

    const mapMarker = marker(
      {
        lat: this.marker.lat,
        lng: this.marker.lon,
      },
      {
        icon: pointIcon(this.color, this.type === 'web' ? 'default' : this.type),
      },
    );
    this.mapLayers.push(mapMarker);

    this.mapReady = true;
  }

  public onMapReady(map: Map) {
    this.map = map;
    control.zoom({ position: 'bottomleft' }).addTo(map);
  }
}
