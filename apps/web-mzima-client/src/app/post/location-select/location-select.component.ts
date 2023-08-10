import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { mapHelper } from '@helpers';
import { MapConfigInterface } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '@services';
import {
  control,
  FitBoundsOptions,
  LatLngBounds,
  LatLngLiteral,
  Map,
  MapOptions,
  marker,
  Marker,
  MarkerClusterGroupOptions,
  tileLayer,
} from 'leaflet';
import 'leaflet.markercluster';
import { pointIcon } from '../../core/helpers/map';
import { alphaNumeric } from '../../core/helpers/regex';
import Geocoder from 'leaflet-control-geocoder';
import { fromEvent, filter, debounceTime, distinctUntilChanged, tap } from 'rxjs';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss'],
})
export class LocationSelectComponent implements OnInit, AfterViewInit {
  @Input() public center: LatLngLiteral;
  @Input() public zoom: number;
  @Input() public location: LatLngLiteral;
  @Input() public required: boolean;
  @Input() public color = 'var(--color-neutral-100)';
  @Input() public type = 'default';
  @Output() locationChange = new EventEmitter();
  public emptyFieldLat = false;
  public emptyFieldLng = false;
  public noSpecialCharactersLat = false;
  public noSpecialCharactersLng = false;
  private map: Map;
  public mapLayers: any[] = [];
  public mapReady = false;
  public mapConfig: MapConfigInterface;
  public markerClusterOptions: MarkerClusterGroupOptions = {
    animate: true,
    maxClusterRadius: 50,
  };
  public mapFitToBounds: LatLngBounds;
  public fitBoundsOptions: FitBoundsOptions = {
    animate: true,
  };
  public mapMarker: Marker;
  public leafletOptions: MapOptions;
  public disabled = false;
  public geocoderControl: any;

  constructor(
    private sessionService: SessionService,
    private cdr: ChangeDetectorRef,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    this.mapConfig = this.getMapConfigurations();

    const currentLayer =
      mapHelper.getMapLayers().baselayers[this.mapConfig.default_view!.baselayer];

    this.leafletOptions = {
      scrollWheelZoom: true,
      zoomControl: false,
      layers: [tileLayer(currentLayer.url, currentLayer.layerOptions)],
      center: [
        this.location?.lat || this.mapConfig.default_view!.lat,
        this.location?.lng || this.mapConfig.default_view!.lon,
      ],
      zoom: this.zoom || this.mapConfig.default_view!.zoom,
    };
    this.markerClusterOptions.maxClusterRadius = this.mapConfig.cluster_radius;

    this.mapReady = true;
  }

  ngAfterViewInit() {
    // change tracking for search when entering text in geocoder search input (and debounce to reduce geocoding requests sent)
    const geocoderInputElement = this.geocoderControl.getContainer().querySelector('input');
    geocoderInputElement.setAttribute('data-qa', 'location-search');
    fromEvent(geocoderInputElement, 'input')
      .pipe(
        filter(Boolean),
        debounceTime(600),
        distinctUntilChanged(),
        tap(() => {
          this.geocoderControl.options.placeholder = geocoderInputElement.value;
          this.geocoderControl._input.value = geocoderInputElement.value;
          this.geocoderControl._geocode();
        }),
        untilDestroyed(this),
      )
      .subscribe();
  }

  private getMapConfigurations(): MapConfigInterface {
    return this.sessionService.getMapConfigurations();
  }

  public onMapReady(map: Map) {
    // Initialize geocoder
    this.geocoderControl = new Geocoder({
      defaultMarkGeocode: false,
      position: 'topleft',
      collapsed: false,
      placeholder: this.translate.instant('post.location.search_address'),
      errorMessage: this.translate.instant('post.location.nothing_found'),
    });

    this.map = map;
    control.zoom({ position: 'bottomleft' }).addTo(this.map);
    this.map.panTo(this.location);
    this.geocoderControl.addTo(this.map);

    this.addMarker();

    this.map.on('click', (e) => {
      this.location = e.latlng;
      this.addMarker();
      this.cdr.detectChanges();
    });

    // Listen event markgeocode from geocoder
    this.geocoderControl.on('markgeocode', (e: any) => {
      this.location = e.geocode.center;
      this.addMarker();
      this.map.fitBounds(e.geocode.bbox);
    });
  }

  private addMarker() {
    this.checkErrors();
    if (this.mapMarker) {
      this.map.removeLayer(this.mapMarker);
    }
    this.mapMarker = marker(this.location, {
      draggable: true,
      icon: pointIcon(this.color, this.type === 'web' ? 'default' : this.type),
    }).addTo(this.map);

    this.mapMarker.on('dragend', (e) => {
      this.location = e.target.getLatLng();
      this.checkErrors();
      this.cdr.detectChanges();
    });
  }

  private changeCoords(error = false) {
    this.locationChange.emit({ location: this.location, error });
    this.cdr.detectChanges();
  }

  public checkErrors() {
    this.emptyFieldLat = this.emptyFieldLng = false;
    this.noSpecialCharactersLat = this.noSpecialCharactersLng = false;

    if (this.required) {
      this.emptyFieldLat = this.location.lat.toString() === '';
      this.emptyFieldLng = this.location.lng.toString() === '';
    }

    if (this.location.lat) {
      this.noSpecialCharactersLat = !alphaNumeric(this.location.lat.toString());
    }

    if (this.location.lng) {
      this.noSpecialCharactersLng = !alphaNumeric(this.location.lng.toString());
    }

    this.changeCoords(
      this.emptyFieldLat ||
        this.emptyFieldLng ||
        this.noSpecialCharactersLat ||
        this.noSpecialCharactersLng,
    );
  }

  public getCurrentLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      const {
        coords: { latitude, longitude },
      } = position;
      this.location.lat = latitude;
      this.location.lng = longitude;
      this.addMarker();
      this.map.setView([latitude, longitude], 12);
    });
  }

  public onFocusOut() {
    this.checkErrors();
  }
}
