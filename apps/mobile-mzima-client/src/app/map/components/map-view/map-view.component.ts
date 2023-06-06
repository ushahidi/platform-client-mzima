import { AfterViewInit, Component, OnInit } from '@angular/core';
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
import { mapHelper, takeUntilDestroy$ } from '@helpers';
import { PostsService, SavedsearchesService } from '@mzima-client/sdk';
import { SessionService } from '@services';
import { MapConfigInterface } from '@models';
import { MainViewComponent } from '@shared';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, debounceTime } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
})
export class MapViewComponent extends MainViewComponent implements OnInit, AfterViewInit {
  public map: Map;
  public isMapReady = false;
  public leafletOptions: MapOptions;
  public mapLayers: any[] = [];
  public mapFitToBounds: LatLngBounds;
  public fitBoundsOptions: FitBoundsOptions = {
    animate: true,
  };
  public progress = 0;
  private mapConfig: MapConfigInterface;
  public markerClusterData = new MarkerClusterGroup();
  public markerClusterOptions: MarkerClusterGroupOptions = { animate: true, maxClusterRadius: 50 };
  filtersSubscription$: Observable<any>;

  constructor(
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override postsService: PostsService,
    protected override savedSearchesService: SavedsearchesService,
    protected override sessionService: SessionService,
  ) {
    super(router, route, postsService, savedSearchesService, sessionService);
    this.filtersSubscription$ = this.postsService.postsFilters$.pipe(takeUntilDestroy$());
    this.sessionService.mapConfig$.subscribe({
      next: (mapConfig) => {
        if (mapConfig) {
          this.mapConfig = mapConfig;

          const currentLayer =
            mapHelper.getMapLayers().baselayers[this.mapConfig.default_view!.baselayer];

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

  ngOnInit(): void {
    this.initFilterListener();
  }

  private initFilterListener() {
    this.filtersSubscription$.pipe(debounceTime(1000)).subscribe({
      next: () => {
        if (this.route.snapshot.data['view'] === 'search' && !this.searchId) return;
        if (this.route.snapshot.data['view'] === 'collection' && !this.collectionId) return;

        this.reInitParams();
        this.getPostsGeoJson();
      },
    });
  }

  private reInitParams() {
    this.params.page = 1;
    this.mapLayers.map((layer) => {
      this.map.removeLayer(layer);
      this.markerClusterData.removeLayer(layer);
    });
    this.mapLayers = [];
  }

  loadData(): void {
    this.reInitParams();
    this.getPostsGeoJson();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.isMapReady = true;
    }, 100);
  }

  public onMapReady(map: Map) {
    this.map = map;
  }

  private getPostsGeoJson() {
    this.postsService
      .getGeojson(this.params)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (posts) => {
          const oldGeoJson: any = posts.results.map((r) => {
            return {
              type: r.geojson.type,
              features: r.geojson.features.map((f) => {
                f.properties = {
                  data_source_message_id: r.data_source_message_id,
                  description: r.description,
                  id: r.id,
                  'marker-color': r['marker-color'],
                  source: r.source,
                  title: r.title,
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
}
