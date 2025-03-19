import { ChangeDetectorRef, Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { mapHelper } from '@helpers';
import { MapConfigInterface, MapViewInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SessionService } from '@services';
import { distinctUntilChanged, debounceTime, Subject, tap } from 'rxjs';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';

@UntilDestroy()
@Component({
  selector: 'app-settings-map',
  templateUrl: './settings-map.component.html',
  styleUrls: ['./settings-map.component.scss'],
})
export class SettingsMapComponent implements OnInit, AfterViewInit {
  @Input() minObfuscation = 0;
  @Input() maxObfuscation = 9;
  leafletOptions: any;

  mapConfig: MapConfigInterface;
  markerLayer: VectorLayer;
  currentLayer: TileLayer<XYZ>;
  map: Map;
  view: View;
  maxZoom = 22; // affects the arrow on number input field for "Default zoom level"
  minZoom = 1; // affects the arrow on number input field for "Default zoom level"
  baseLayers = mapHelper.getOpenLayersMapConfig().filter((layer) => layer.visible);

  public geocoderControl: any;
  public queryLocation: string = '';
  private searchSubject = new Subject<string>();
  public geocodingResults: any[] = [];
  public isShowGeocodingResults = false;
  locationPrecisionEnabled: any;
  currentPrecision = 9;
  public query$: Subject<any> = new Subject<any>();

  constructor(private sessionService: SessionService, private changeDetector: ChangeDetectorRef) {
    this.query$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        tap(({ target: { value } }) => this.searchLocation(value)),
        untilDestroyed(this),
      )
      .subscribe();
  }

  ngOnInit(): void {
    this.mapConfig = this.sessionService.getMapConfigurations();
    this.currentPrecision = this.getPrecision();
    this.locationPrecisionEnabled =
      !!this.sessionService.getFeatureConfigurations()['anonymise-reporters']?.enabled;
  }

  ngAfterViewInit(): void {
    const visibleLayer =
      this.baseLayers.find((layer) => layer.code === this.mapConfig.default_view?.baselayer) ||
      this.baseLayers.find((layer) => layer.code === 'streets');

    if (visibleLayer) {
      this.view = new View({
        center: fromLonLat([this.mapConfig.default_view!.lon, this.mapConfig.default_view!.lat]),
        zoom: this.mapConfig.default_view?.zoom || 2,
      });
      this.currentLayer = new TileLayer({
        visible: true,
        source: new XYZ({
          url: visibleLayer.url,
        }),
      });

      this.map = new Map({
        view: this.view,
        layers: [this.currentLayer],
        target: 'ol-map',
      });
    }
    this.map.on('click', (evt: any) => {
      const [lng, lat] = toLonLat(evt.coordinate);
      this.setCoordinates(lat, lng);
    });

    this.view.on('change:resolution', () => {
      this.mapConfig.default_view!.zoom = Number(this.view.getZoom());
      this.changeDetector.detectChanges();
    });

    this.addMarker();
  }

  addMarker() {
    if (this.markerLayer) this.map.removeLayer(this.markerLayer);
    const marker = new Feature({
      geometry: new Point(
        fromLonLat([this.mapConfig.default_view!.lon, this.mapConfig.default_view!.lat]),
      ),
    });
    this.markerLayer = new VectorLayer({
      zIndex: 1000,
      source: new VectorSource({
        features: [marker],
      }),
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: mapHelper.imageIcon('default'),
        }),
      }),
    });
    this.map.addLayer(this.markerLayer);
  }

  addTileLayerToMap(code: MapViewInterface['baselayer']) {
    const newBase = mapHelper.getOpenLayersMapConfig().find((layer) => layer.code === code);
    const newLayer = new TileLayer({
      visible: true,
      zIndex: 0,
      source: new XYZ({
        url: newBase!.url,
      }),
    });
    this.map.removeLayer(this.currentLayer);
    this.currentLayer = newLayer;
    this.map.addLayer(this.currentLayer);
  }

  layerChange(newLayer: MapViewInterface['baselayer']) {
    this.addTileLayerToMap(newLayer);
  }

  private updateMapPreview() {
    // Center the map at our current default.
    // Set the zoom level to our default zoom.
    this.view.setCenter(
      fromLonLat([this.mapConfig.default_view!.lon, this.mapConfig.default_view!.lat]),
    );

    this.view.setZoom(this.mapConfig.default_view!.zoom);
    this.changeDetector.detectChanges();
  }

  public searchLocation(query: string) {
    this.searchSubject.next(query);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      .then((response) => response.json())
      .then((data) => {
        this.geocodingResults = data.length > 0 ? data : [];
        this.isShowGeocodingResults = true;
      })
      .catch((error) => {
        console.error('Error fetching location data:', error);
        this.geocodingResults = [];
      });
  }

  public selectLocation(item: any) {
    this.queryLocation = item.name;
    this.view.setCenter(fromLonLat([item.lon, item.lat]));
    this.view.setZoom(10);
    this.setCoordinates(item.lat, item.lon);
    this.geocodingResults = [];
    this.searchSubject.next('');
  }

  private setCoordinates(lat: number, lon: number) {
    this.mapConfig.default_view!.lat = lat;
    this.mapConfig.default_view!.lon = lon;
    this.addMarker();
    this.updateMapPreview();
  }

  public onZoomChange(): void {
    if (this.view) {
      this.view.setZoom(this.mapConfig.default_view!.zoom);
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
