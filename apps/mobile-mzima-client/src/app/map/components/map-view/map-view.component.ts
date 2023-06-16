import { AfterViewInit, Component } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  FitBoundsOptions,
  geoJSON,
  LatLngBounds,
  Map,
  MapOptions,
  MarkerClusterGroup,
  MarkerClusterGroupOptions,
  tileLayer,
} from 'leaflet';
import { mapHelper } from '@helpers';
import { PostsService } from '@mzima-client/sdk';
import { SessionService } from '@services';
import { MapConfigInterface } from '@models';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent implements AfterViewInit {
  public map: Map;
  public isMapReady = false;
  public leafletOptions: MapOptions;
  public mapLayers: any[] = [];
  public mapFitToBounds: LatLngBounds;
  public fitBoundsOptions: FitBoundsOptions = {
    animate: true,
  };
  private mapConfig: MapConfigInterface;
  public markerClusterData = new MarkerClusterGroup();
  public markerClusterOptions: MarkerClusterGroupOptions = { animate: true, maxClusterRadius: 50 };
  public $destroy = new Subject();
  private isDarkMode = false;
  private baseLayer: 'streets' | 'satellite' | 'hOSM' | 'MapQuestAerial' | 'MapQuest' | 'dark';

  constructor(private postsService: PostsService, private sessionService: SessionService) {
    const mediaDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    mediaDarkMode.addEventListener('change', (ev) => this.switchMode(ev));
    this.isDarkMode = mediaDarkMode.matches;

    this.initFilterListener();
    this.sessionService.mapConfig$.subscribe({
      next: (mapConfig) => {
        if (mapConfig) {
          this.mapConfig = mapConfig;

          this.baseLayer = this.mapConfig.default_view!.baselayer;
          const currentLayer =
            mapHelper.getMapLayers().baselayers[
              this.isDarkMode &&
              this.baseLayer !== 'satellite' &&
              this.baseLayer !== 'MapQuestAerial' &&
              this.baseLayer !== 'hOSM'
                ? 'dark'
                : this.baseLayer
            ];

          this.leafletOptions = {
            minZoom: 3,
            maxZoom: 17,
            scrollWheelZoom: true,
            zoomControl: false,
            layers: [tileLayer(currentLayer.url, currentLayer.layerOptions)],
            center: [this.mapConfig.default_view!.lat, this.mapConfig.default_view!.lon],
            zoom: this.mapConfig.default_view!.zoom,
          };
          this.markerClusterOptions.maxClusterRadius = this.mapConfig.cluster_radius;
        }
      },
    });
  }

  private switchMode(systemInitiatedDark: any) {
    this.isDarkMode = systemInitiatedDark.matches;

    const currentLayer =
      mapHelper.getMapLayers().baselayers[
        this.isDarkMode &&
        this.baseLayer !== 'satellite' &&
        this.baseLayer !== 'MapQuestAerial' &&
        this.baseLayer !== 'hOSM'
          ? 'dark'
          : this.baseLayer
      ];

    this.leafletOptions.layers = [tileLayer(currentLayer.url, currentLayer.layerOptions)];

    this.isMapReady = false;
    setTimeout(() => {
      this.isMapReady = true;
    }, 50);
  }

  private initFilterListener() {
    this.postsService.postsFilters$.pipe(debounceTime(500), takeUntil(this.$destroy)).subscribe({
      next: () => {
        this.reInitParams();
        this.getPostsGeoJson();
      },
    });
  }

  private reInitParams() {
    this.mapLayers.map((layer) => {
      this.map.removeLayer(layer);
      this.markerClusterData.removeLayer(layer);
    });
    this.mapLayers = [];
  }

  ngAfterViewInit(): void {
    this.isMapReady = true;
  }

  public onMapReady(map: Map) {
    this.map = map;
  }

  private getPostsGeoJson() {
    this.postsService
      .getGeojson({ limit: 1000 })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (posts) => {
          const oldGeoJson: any = posts.results.map((r) => {
            return {
              type: r.geojson.type,
              features: r.geojson.features.map((f) => {
                f.properties = {
                  id: r.id,
                  type: r.source,
                };
                return f;
              }),
            };
          });
          const geoPosts = geoJSON(oldGeoJson, {
            pointToLayer: mapHelper.pointToLayer,
            onEachFeature: (feature, layer) => {
              layer.on('mouseout', () => {
                layer.unbindPopup();
              });
              layer.on('click', () => {
                console.log('show post preview: ', layer);
              });
            },
          });

          if (this.mapConfig.clustering) {
            this.markerClusterData.addLayer(geoPosts);
            this.mapLayers.push(this.markerClusterData);
          } else {
            this.mapLayers.push(geoPosts);
          }

          if (posts.results.length) {
            this.mapFitToBounds = geoPosts.getBounds();
          }
        },
        error: (err) => {
          if (err.message.match(/Http failure response for/)) {
            setTimeout(() => this.getPostsGeoJson(), 5000);
          }
        },
      });
  }

  public destroy(): void {
    this.$destroy.next(null);
    this.$destroy.complete();
  }
}
