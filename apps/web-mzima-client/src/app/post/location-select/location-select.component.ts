import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
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
import { decimalPattern } from '../../core/helpers/regex';
import Geocoder from 'leaflet-control-geocoder';

@Component({
  selector: 'app-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => LocationSelectComponent),
    },
  ],
})
export class LocationSelectComponent implements OnInit {
  @Input() public center: LatLngLiteral;
  @Input() public zoom: number;
  @Input() public location: LatLngLiteral;
  @Input() public required: boolean;
  @Output() locationChange = new EventEmitter();
  public emptyFieldLat = false;
  public emptyFieldLng = false;
  public noLetterLat = false;
  public noLetterLng = false;
  private mapBox: Map;
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

  private getMapConfigurations(): MapConfigInterface {
    return this.sessionService.getMapConfigurations();
  }

  public onMapReady(mapBox: Map) {
    // Initialize geocoder
    this.geocoderControl = new Geocoder({
      defaultMarkGeocode: false,
      position: 'topleft',
      collapsed: false,
      placeholder: this.translate.instant('post.location.search_address'),
      errorMessage: this.translate.instant('post.location.nothing_found'),
    });

    this.mapBox = mapBox;
    control.zoom({ position: 'bottomleft' }).addTo(this.mapBox);
    this.mapBox.panTo(this.location);

    // Connect geocoder to map
    this.geocoderControl.addTo(this.mapBox);
    this.addMarker();

    // change tracking for search when entering text
    const geocoderInputElement = this.geocoderControl.getContainer().querySelector('input');
    if (geocoderInputElement) {
      geocoderInputElement.addEventListener('input', (event: any) => {
        const value = event.target.value;
        if (value.length > 2) {
          this.geocoderControl.options.placeholder = value;
          this.geocoderControl._input.value = value;
          this.geocoderControl._geocode();
        }
      });
    }

    this.mapBox.on('click', (e) => {
      this.location = e.latlng;
      this.addMarker();
      this.cdr.detectChanges();
    });

    // Listen event markgeocode from geocoder
    this.geocoderControl.on('markgeocode', (e: any) => {
      this.location = e.geocode.center;
      this.addMarker();
      this.mapBox.fitBounds(e.geocode.bbox);
    });
  }

  private addMarker() {
    if (this.mapMarker) {
      this.mapBox.removeLayer(this.mapMarker);
    }
    this.mapMarker = marker(this.location, {
      draggable: true,
      icon: pointIcon(this.mapConfig.default_view!.color),
    }).addTo(this.mapBox);

    this.mapMarker.on('dragend', (e) => {
      console.log('dragend');
      this.location = e.target.getLatLng();
      this.cdr.detectChanges();
    });
  }

  public changeCoords() {
    this.locationChange.emit(this.location);
    this.cdr.detectChanges();
    this.checkErrors();
  }

  private checkErrors() {
    this.emptyFieldLat = this.location.lat.toString() === '';
    this.emptyFieldLng = this.location.lng.toString() === '';

    if (this.location.lat) {
      this.noLetterLat = !decimalPattern(this.location.lat.toString());
    }

    if (this.location.lng) {
      this.noLetterLng = !decimalPattern(this.location.lng.toString());
    }
  }

  public getCurrentLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      const {
        coords: { latitude, longitude },
      } = position;
      this.location.lat = latitude;
      this.location.lng = longitude;
      this.addMarker();
      this.mapBox.setView([latitude, longitude], 12);
    });
  }
}
