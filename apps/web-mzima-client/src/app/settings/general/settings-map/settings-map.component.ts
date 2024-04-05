import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { mapHelper } from '@helpers';
import { MapConfigInterface, MapViewInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
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
import Geocoder from 'leaflet-control-geocoder';
import { BehaviorSubject, debounceTime, Subject } from 'rxjs';
import { pointIcon } from '../../../core/helpers/map';

@UntilDestroy()
@Component({
  selector: 'app-settings-map',
  templateUrl: './settings-map.component.html',
  styleUrls: ['./settings-map.component.scss'],
})
export class SettingsMapComponent implements OnInit {
  @Input() minObfuscation = 0;
  @Input() maxObfuscation = 9;
  leafletOptions: any;
  map: Map;
  mapMarker: Marker;
  mapLayers: Layer[] = [];
  mapConfig: MapConfigInterface;
  mapReady = false;
  maxZoom = 22; // affects the arrow on number input field for "Default zoom level"
  minZoom = 1; // affects the arrow on number input field for "Default zoom level"
  baseLayers = Object.values(mapHelper.getMapLayers().baselayers);

  public geocoderControl: any;
  public queryLocation: string = '';
  private searchSubject = new Subject<string>();
  public geocodingResults: any[] = [];
  public citiesOptions: BehaviorSubject<any[]>;
  public isShowGeocodingResults = false;
  locationPrecisionEnabled: any;
  currentPrecision = 9;

  constructor(private sessionService: SessionService, private changeDetector: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(600), untilDestroyed(this)).subscribe((query) => {
      this.performSearch(query);
    });
    this.citiesOptions = new BehaviorSubject<any[]>([]);

    this.mapConfig = this.sessionService.getMapConfigurations();
    this.currentPrecision = this.getPrecision();

    this.locationPrecisionEnabled =
      !!this.sessionService.getFeatureConfigurations()['anonymise-reporters']?.enabled;

    this.leafletOptions = {
      scrollWheelZoom: true,
      zoomControl: false,
      layers: [],
      center: [this.mapConfig.default_view!.lat, this.mapConfig.default_view!.lon],
      zoom: this.mapConfig.default_view!.zoom,
    };
    this.mapReady = true;
    this.addTileLayerToMap(this.mapConfig.default_view!.baselayer);
  }

  addMarker() {
    if (this.mapMarker) this.map.removeLayer(this.mapMarker);

    this.mapMarker = marker(this.map.getCenter(), {
      draggable: true,
      icon: pointIcon(this.mapConfig.default_view!.color),
    }).addTo(this.map);

    this.mapMarker.on('dragend', (e) => {
      this.handleDragEnd(e);
    });
  }

  addTileLayerToMap(code: MapViewInterface['baselayer']) {
    const currentLayer = mapHelper.getMapLayers().baselayers[code];
    this.mapLayers = this.mapLayers.filter((layer) => !(layer instanceof TileLayer));
    this.mapLayers.push(tileLayer(currentLayer.url, currentLayer.layerOptions));
  }

  layerChange(newLayer: MapViewInterface['baselayer']) {
    this.addTileLayerToMap(newLayer);
  }

  onMapReady(map: Map) {
    // Initialize geocoder
    this.geocoderControl = new Geocoder({
      defaultMarkGeocode: false,
      position: 'topleft',
      collapsed: false,
    });

    this.map = map;
    control.zoom({ position: 'bottomleft' }).addTo(this.map);
    this.addMarker();

    this.geocoderControl.addTo(this.map);

    this.map.on('click', (e) => {
      this.mapClick(e);
    });

    this.map.on('zoomend', () => {
      this.mapConfig.default_view!.zoom = map.getZoom();
      this.changeDetector.detectChanges();
    });

    this.geocoderControl.on('finishgeocode', (e: any) => {
      this.citiesOptions.next(e.results);
      this.geocodingResults = e.results;
    });
  }

  private updateMapPreview() {
    // Center the map at our current default.
    // Set the zoom level to our default zoom.
    this.map.setView(
      [this.mapConfig.default_view!.lat, this.mapConfig.default_view!.lon],
      this.mapConfig.default_view!.zoom,
    );

    // Update our draggable marker to the default.
    this.mapMarker.setLatLng([this.mapConfig.default_view!.lat, this.mapConfig.default_view!.lon]);
    this.changeDetector.detectChanges();
  }

  private mapClick(e: LeafletMouseEvent) {
    const coordinates = e.latlng.wrap();
    this.setCoordinates(coordinates.lat, coordinates.lng);
  }

  private handleDragEnd(e: DragEndEvent) {
    const coordinates = e.target.getLatLng().wrap();
    this.setCoordinates(coordinates.lat, coordinates.lng);
  }

  public searchLocation() {
    this.isShowGeocodingResults = true;
    this.searchSubject.next(this.queryLocation);
  }

  private performSearch(query: string) {
    this.geocoderControl.options.placeholder = query;
    this.geocoderControl._input.value = query;
    this.geocoderControl._geocode();
  }

  public selectLocation(item: any) {
    this.queryLocation = item.name;
    const coordinates = item.center;
    this.map.fitBounds(item.bbox);
    this.setCoordinates(coordinates.lat, coordinates.lng);
    this.geocodingResults = [];
    this.citiesOptions.next([]);
    this.searchSubject.next('');
  }

  public clearSearch() {
    this.queryLocation = '';
    this.geocodingResults = [];
    this.citiesOptions.next([]);
  }

  private setCoordinates(lat: number, lon: number) {
    this.mapConfig.default_view!.lat = lat;
    this.mapConfig.default_view!.lon = lon;
    this.addMarker();
    this.updateMapPreview();
  }

  public onZoomChange(): void {
    if (this.map) {
      this.map.setZoom(this.mapConfig.default_view!.zoom);
    }
  }

  public updatePrecision() {
    this.currentPrecision = this.getPrecision();
    this.updateMapPreview();
  }

  private getPrecision() {
    return this.sessionService.getPrecision(this.mapConfig.location_precision!);
  }
}
