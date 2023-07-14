import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';
import { STORAGE_KEYS } from '@constants';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { DatabaseService } from '@services';
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
import Geocoder from 'leaflet-control-geocoder';
import { debounceTime, Subject } from 'rxjs';
import { mapHelper, regexHelper } from '@helpers';
import { Platform } from '@ionic/angular';

export interface MapViewInterface {
  baselayer: 'streets' | 'satellite' | 'hOSM' | 'MapQuestAerial' | 'MapQuest';
  color: string;
  fit_map_boundaries: boolean;
  icon: string;
  lat: number;
  lon: number;
  zoom: number;
}

export interface MapConfigInterface {
  allowed_privileges?: string[];
  cluster_radius?: number;
  clustering?: boolean;
  default_view?: MapViewInterface;
  location_precision?: number;
}

@UntilDestroy()
@Component({
  selector: 'app-location-select',
  templateUrl: './location-select.component.html',
  styleUrls: ['./location-select.component.scss'],
})
export class LocationSelectComponent implements OnInit {
  @ViewChild('resultList') resultList: ElementRef;
  @Input() public center: LatLngLiteral;
  @Input() public zoom: number;
  @Input() public location: LatLngLiteral;
  @Input() public required: boolean;
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

  public queryLocation: string = '';
  private searchSubject = new Subject<string>();
  public geocodingResults: any[] = [];
  public isShowGeocodingResults = false;
  public nativeApp: boolean;

  constructor(
    private cdr: ChangeDetectorRef,
    private dataBaseService: DatabaseService,
    private platform: Platform,
  ) {
    this.searchSubject.pipe(debounceTime(600), untilDestroyed(this)).subscribe((query) => {
      this.performSearch(query);
    });
  }

  async ngOnInit(): Promise<void> {
    if (Capacitor.getPlatform() !== 'web') {
      this.nativeApp = true;
    }

    this.mapConfig = await this.dataBaseService.get(STORAGE_KEYS.MAP);

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

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (this.resultList && !this.resultList.nativeElement.contains(event.target)) {
      this.isShowGeocodingResults = false;
    }
  }

  public onMapReady(map: Map) {
    // Initialize geocoder
    this.geocoderControl = new Geocoder({
      defaultMarkGeocode: false,
      position: 'topleft',
      collapsed: false,
    });

    this.map = map;
    control.zoom({ position: 'bottomleft' }).addTo(this.map);
    this.map.panTo(this.location);

    this.geocoderControl.addTo(this.map);
    this.addMarker();

    this.getCurrentLocation();

    this.map.on('click', (e) => {
      this.location = e.latlng;
      this.addMarker();
      this.cdr.detectChanges();
    });

    this.geocoderControl.on('finishgeocode', (e: any) => {
      this.geocodingResults = e.results;
    });
  }

  private addMarker() {
    this.checkErrors();
    if (this.mapMarker) {
      this.map.removeLayer(this.mapMarker);
    }
    this.mapMarker = marker(this.location, {
      draggable: true,
      icon: mapHelper.pointIcon('default', 'var(--color-neutral-100)'),
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
      this.noSpecialCharactersLat = !regexHelper.alphaNumeric(this.location.lat.toString());
    }

    if (this.location.lng) {
      this.noSpecialCharactersLng = !regexHelper.alphaNumeric(this.location.lng.toString());
    }

    this.changeCoords(
      this.emptyFieldLat ||
        this.emptyFieldLng ||
        this.noSpecialCharactersLat ||
        this.noSpecialCharactersLng,
    );
  }

  public async getCurrentLocation() {
    if (!this.platform.is('capacitor')) return;
    try {
      const status = await Geolocation.requestPermissions();
      if (status?.location === 'granted') {
        const location = await Geolocation.getCurrentPosition();
        const {
          coords: { latitude, longitude },
        } = location;
        this.location.lat = latitude;
        this.location.lng = longitude;
        this.addMarker();
        this.map.setView([latitude, longitude], 12);
      }
    } catch (e) {
      console.log(e);
    }
  }

  public onFocusOut() {
    this.checkErrors();
  }

  searchLocation() {
    this.isShowGeocodingResults = true;
    this.searchSubject.next(this.queryLocation);
  }

  performSearch(query: string) {
    this.geocoderControl.options.placeholder = query;
    this.geocoderControl._input.value = query;
    this.geocoderControl._geocode();
  }

  selectlocation(item: any) {
    this.location = item.center;
    this.addMarker();
    this.map.fitBounds(item.bbox);
    this.geocodingResults = [];
  }
}
