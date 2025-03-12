import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { mapHelper } from '@helpers';
import { MapConfigInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '@services';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Style from 'ol/style/Style';
import { distinctUntilChanged, tap, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Point } from 'ol/geom';
import Icon from 'ol/style/Icon';
import 'leaflet.markercluster';

@UntilDestroy()
@Component({
  selector: 'app-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss'],
})
export class LocationSelectComponent implements OnInit {
  @Input() public zoom: number;
  @Input() public location: any;
  @Input() public required: boolean;
  @Input() public color = 'var(--color-neutral-100)';
  @Input() public type = 'default';
  @Input() public isEditPost: boolean = false;
  @Output() locationChange = new EventEmitter();
  public searchTerm: string = '';
  public emptyFieldLat = false;
  public emptyFieldLng = false;
  public noSpecialCharactersLat = false;
  public noSpecialCharactersLng = false;
  private map: Map;
  public mapLayers: any[] = [];
  public mapReady = false;
  public mapConfig: MapConfigInterface;
  public disabled = false;
  public locations: any[] = [];
  public query$: Subject<any> = new Subject<any>();
  private markerLayer: VectorLayer;

  constructor(private sessionService: SessionService, private translate: TranslateService) {
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
    if (!this.isEditPost && !this.location.lat) {
      this.location.lat = this.mapConfig.default_view!.lat;
      this.location.lng = this.mapConfig.default_view!.lon;
    }
    const baseLayer = mapHelper.getMapLayers().baselayers[this.mapConfig.default_view!.baselayer];
    const currentLayer = new TileLayer({
      visible: true,
      source: new XYZ({
        url: baseLayer.url,
        maxZoom: 'maxZoom' in baseLayer.layerOptions ? baseLayer.layerOptions.maxZoom : undefined,
      }),
    });
    const view = new View({
      center: fromLonLat([this.location.lng, this.location.lat]),
      zoom: this.mapConfig.default_view?.zoom || 2,
    });

    this.map = new Map({
      view: view,
      layers: [currentLayer],
      target: 'ol-map',
    });
    if (this.isEditPost) {
      this.setMarker();
    }
    this.map.on('click', (evt) => {
      const coordinate = evt.coordinate;
      const geolocation = toLonLat(coordinate);
      this.location = { lat: geolocation[1], lng: geolocation[0] };
      this.setMarker();
      this.changeCoords();
    });
  }

  public searchLocation(query: string) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      .then((response) => response.json())
      .then((data) => {
        this.locations = data.length > 0 ? data : [];
      })
      .catch((error) => {
        console.error('Error fetching location data:', error);
        this.locations = [];
      });
  }

  public selectLocation(location: any) {
    this.location = { lat: location.lat, lng: location.lon };
    this.locations = [];
    this.setMarker();
    this.locations = [];
    this.changeCoords();
  }

  private setMarker() {
    if (this.markerLayer) this.map.removeLayer(this.markerLayer);
    const marker = new Feature({
      geometry: new Point(fromLonLat([this.location.lng, this.location.lat])),
    });

    this.markerLayer = new VectorLayer({
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

  private getMapConfigurations(): MapConfigInterface {
    return this.sessionService.getMapConfigurations();
  }

  private changeCoords(error = false) {
    this.locationChange.emit({ location: this.location, error });
  }

  public checkErrors() {
    this.emptyFieldLat = this.emptyFieldLng = false;

    if (this.required) {
      this.emptyFieldLat = this.location.lat.toString() === '';
      this.emptyFieldLng = this.location.lng.toString() === '';
    }

    this.changeCoords(this.emptyFieldLat || this.emptyFieldLng);
  }

  public onFocusOut() {
    this.checkErrors();
  }

  public clearLocationField() {
    this.location = {
      lat: '',
      lng: '',
    };
    this.checkErrors();
  }
}
