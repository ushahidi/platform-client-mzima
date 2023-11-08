import { Component, NgZone, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mapHelper, takeUntilDestroy$ } from '@helpers';
import { MapConfigInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MainViewComponent } from '@shared';
import {
  Content,
  control,
  FeatureGroup,
  FitBoundsOptions,
  geoJSON,
  LatLngBounds,
  Map,
  MapOptions,
  MarkerClusterGroup,
  MarkerClusterGroupOptions,
  tileLayer,
} from 'leaflet';
import 'leaflet.markercluster';
import { debounceTime, Observable } from 'rxjs';
import { PostPreviewComponent } from '../post/post-preview/post-preview.component';
import { PostDetailsModalComponent } from './post-details-modal/post-details-modal.component';
import {
  MediaService,
  SavedsearchesService,
  PostsService,
  GeoJsonPostsResponse,
} from '@mzima-client/sdk';
import { SessionService, EventBusService, EventType, BreakpointService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent extends MainViewComponent implements OnInit {
  public map: Map;
  postsCollection: GeoJsonPostsResponse;
  mapLayers: any[] = [];
  mapReady = false;
  mapConfig: MapConfigInterface;
  markerClusterData = new MarkerClusterGroup();
  markerClusterOptions: MarkerClusterGroupOptions = { animate: true, maxClusterRadius: 50 };
  mapFitToBounds: LatLngBounds;
  fitBoundsOptions: FitBoundsOptions = {
    animate: true,
  };
  filtersSubscription$: Observable<any>;
  public leafletOptions: MapOptions;
  public progress = 0;
  public isFiltersVisible: boolean;
  public isMainFiltersOpen: boolean;

  constructor(
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override postsService: PostsService,
    protected override savedSearchesService: SavedsearchesService,
    protected override eventBusService: EventBusService,
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private view: ViewContainerRef,
    private dialog: MatDialog,
    private zone: NgZone,
    private mediaService: MediaService,
  ) {
    super(
      router,
      route,
      postsService,
      savedSearchesService,
      eventBusService,
      sessionService,
      breakpointService,
    );
    this.filtersSubscription$ = this.postsService.postsFilters$.pipe(takeUntilDestroy$());
  }

  ngOnInit() {
    this.route.params.subscribe(() => {
      this.initCollection();
    });
    this.initFilterListener();
    this.mapConfig = this.sessionService.getMapConfigurations();

    const currentLayer =
      mapHelper.getMapLayers().baselayers[this.mapConfig.default_view!.baselayer];

    this.leafletOptions = {
      minZoom: 0,
      maxZoom: 22,
      scrollWheelZoom: true,
      zoomControl: false,
      layers: [tileLayer(currentLayer.url, currentLayer.layerOptions)],
      center: [this.mapConfig.default_view!.lat, this.mapConfig.default_view!.lon],
      zoom: this.mapConfig.default_view!.zoom,
    };
    this.markerClusterOptions.maxClusterRadius = this.mapConfig.cluster_radius;

    this.mapReady = true;

    this.eventBusService.on(EventType.SearchOptionSelected).subscribe({
      next: (option) => {
        this.map.setZoom(12);
        this.map.panTo({ lat: option.lat, lng: option.lon });
      },
    });

    this.sessionService.isFiltersVisible$.pipe(untilDestroyed(this)).subscribe({
      next: (isFiltersVisible) => {
        setTimeout(() => {
          this.isFiltersVisible = isFiltersVisible;
        }, 1);
      },
    });

    this.sessionService.isMainFiltersHidden$.pipe(untilDestroyed(this)).subscribe({
      next: (isMainFiltersHidden: boolean) => {
        setTimeout(() => {
          this.isMainFiltersOpen = !isMainFiltersHidden;
        }, 1);
      },
    });

    this.initCollectionRemoveListener();
    this.getUserData();
  }

  loadData(): void {
    this.reInitParams();
    this.getPostsGeoJson();
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

  onMapReady(map: Map) {
    this.map = map;
    control.zoom({ position: 'bottomleft' }).addTo(map);
  }

  getPostsGeoJson() {
    this.postsService
      .getGeojson(this.params)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (posts) => {
          const oldGeoJson: any = posts.results.map((r) => {
            return {
              type: r.geojson?.type,
              features:
                r.geojson?.features.map((f) => {
                  f.properties = {
                    data_source_message_id: r.data_source_message_id,
                    description: r.description,
                    id: r.id,
                    'marker-color': r['marker-color'],
                    source: r.source,
                    title: r.title,
                  };
                  return f;
                }) ?? [],
            };
          });
          const geoPosts = geoJSON(oldGeoJson, {
            pointToLayer: mapHelper.pointToLayer,
            onEachFeature: (feature, layer) => {
              layer.on('mouseout', () => {
                layer.unbindPopup();
              });
              layer.on('click', () => {
                this.zone.run(() => {
                  if (layer instanceof FeatureGroup) {
                    layer = layer.getLayers()[0];
                  }

                  if (layer.getPopup()) {
                    layer.openPopup();
                  } else {
                    const comp = this.view.createComponent(PostPreviewComponent);
                    this.postsService.getById(feature.properties.id).subscribe({
                      next: (post) => {
                        comp.setInput('post', post);
                        comp.setInput('user', this.user);

                        this.postsService.getById(feature.properties.id).subscribe({
                          next: (postV5) => {
                            comp.instance.details$.subscribe({
                              next: () => {
                                this.showPostDetailsModal(
                                  postV5,
                                  post.color,
                                  post.data_source_message_id,
                                );
                              },
                            });

                            comp.instance.edit.subscribe({
                              next: () => {
                                this.showPostDetailsModal(
                                  postV5,
                                  post.color,
                                  post.data_source_message_id,
                                  true,
                                );
                              },
                            });

                            comp.instance.deleted$.subscribe({
                              next: () => {
                                layer.togglePopup();
                                this.loadData();
                              },
                            });

                            const mediaField = postV5.post_content?.[0].fields.find(
                              (field: any) => field.type === 'media',
                            );
                            if (mediaField && mediaField.value?.value) {
                              this.mediaService.getById(mediaField.value.value).subscribe({
                                next: (media) => {
                                  comp.setInput('media', media.result);
                                },
                              });
                            }
                            const popup: Content = comp.location.nativeElement;

                            layer.bindPopup(popup, {
                              maxWidth: 360,
                              minWidth: 360,
                              maxHeight: window.innerHeight - 176,
                              closeButton: false,
                              className: 'pl-popup',
                            });

                            layer.openPopup(); // This one is for fit popup in view
                          },
                        });
                      },
                    });
                  }
                });
              });
            },
          });

          if (this.mapConfig.clustering) {
            this.markerClusterData.addLayer(geoPosts);
            this.mapLayers.push(this.markerClusterData);
          } else {
            this.mapLayers.push(geoPosts);
          }

          if (
            this.params.limit &&
            this.params.page &&
            posts.meta.total > this.params.limit * this.params.page
          ) {
            this.progress = ((this.params.limit * this.params.page) / posts.count) * 100;

            this.params.page++;
            this.getPostsGeoJson();
          } else {
            this.progress = 100;
            if (posts.results.length) {
              this.mapFitToBounds = geoPosts.getBounds();
            }
          }

          // if (posts.results.length && this.params.page <= this.params.limit) {
          //   this.mapFitToBounds = geoPosts.getBounds();
          // }
        },
        error: (err) => {
          if (err.message.match(/Http failure response for/)) {
            setTimeout(() => this.getPostsGeoJson(), 5000);
          }
        },
      });
  }

  private showPostDetailsModal(
    post: any,
    color: string,
    twitterId?: string,
    editable?: boolean,
  ): void {
    this.dialog.open(PostDetailsModalComponent, {
      width: '100%',
      maxWidth: 576,
      data: { post, color, twitterId, editable },
      height: 'auto',
      maxHeight: '90vh',
      panelClass: ['modal', 'post-modal'],
    });
  }
}
