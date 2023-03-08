import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { mapHelper } from '@helpers';
import { MapConfigInterface, MapViewInterface } from '@models';
import { SessionService } from '@services';
import {
  control,
  DragEndEvent,
  Layer,
  LeafletMouseEvent,
  Map,
  Marker,
  marker,
  TileLayer,
  tileLayer,
} from 'leaflet';
import { pointIcon } from '../../../core/helpers/map';

@Component({
  selector: 'app-settings-map',
  templateUrl: './settings-map.component.html',
  styleUrls: ['./settings-map.component.scss'],
})
export class SettingsMapComponent implements OnInit {
  leafletOptions: any;
  settingMap: Map;
  mapMarker: Marker;
  mapLayers: Layer[] = [];
  mapConfig: MapConfigInterface;
  mapReady = false;
  maxZoom = 18;
  minZoom = 0;
  baseLayers = Object.keys(mapHelper.getMapLayers().baselayers);

  constructor(
    private sessionService: SessionService,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.mapConfig = this.sessionService.getMapConfigurations();

    this.leafletOptions = {
      scrollWheelZoom: true,
      zoomControl: false,
      layers: [],
      center: [
        this.mapConfig.default_view!.lat,
        this.mapConfig.default_view!.lon,
      ],
      zoom: this.mapConfig.default_view!.zoom,
    };
    this.mapReady = true;
    this.addTileLayerToMap(this.mapConfig.default_view!.baselayer);
  }

  addMarker(map: Map) {
    this.mapMarker = marker(map.getCenter(), {
      draggable: true,
      icon: pointIcon(this.mapConfig.default_view!.color),
    });
    this.mapMarker.on('dragend', (e) => {
      this.handleDragEnd(e);
    });
    this.mapLayers.push(this.mapMarker);
  }

  addTileLayerToMap(code: MapViewInterface['baselayer']) {
    const currentLayer = mapHelper.getMapLayers().baselayers[code];
    this.mapLayers = this.mapLayers.filter(
      (layer) => !(layer instanceof TileLayer)
    );
    this.mapLayers.push(tileLayer(currentLayer.url, currentLayer.layerOptions));
  }

  layerChange(newLayer: MapViewInterface['baselayer']) {
    this.addTileLayerToMap(newLayer);
  }

  onMapReady(map: Map) {
    control.zoom({ position: 'bottomleft' }).addTo(map);
    this.addMarker(map);
    this.settingMap = map;
    map.on('click', (e) => {
      this.mapClick(e);
    });
    map.on('zoomend', () => {
      this.mapConfig.default_view!.zoom = map.getZoom();
      this.changeDetector.detectChanges();
    });
  }

  updateMapPreview() {
    // Center the map at our current default.
    // Set the zoom level to our default zoom.
    this.settingMap.setView(
      [this.mapConfig.default_view!.lat, this.mapConfig.default_view!.lon],
      this.mapConfig.default_view!.zoom
    );

    // Update our draggable marker to the default.
    this.mapMarker.setLatLng([
      this.mapConfig.default_view!.lat,
      this.mapConfig.default_view!.lon,
    ]);
    this.changeDetector.detectChanges();
  }

  mapClick(e: LeafletMouseEvent) {
    const latlng = e.latlng.wrap();
    this.mapConfig.default_view!.lat = latlng.lat;
    this.mapConfig.default_view!.lon = latlng.lng;

    this.updateMapPreview();
  }

  handleDragEnd(e: DragEndEvent) {
    const latlng = e.target.getLatLng().wrap();
    this.mapConfig.default_view!.lat = latlng.lat;
    this.mapConfig.default_view!.lon = latlng.lng;
    this.updateMapPreview();
  }
}
