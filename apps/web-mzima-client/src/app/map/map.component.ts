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
  cachedFilter: string;
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
    this.reInitParams();
    this.route.params.subscribe(() => {
      this.initCollection();
    });
    this.initFilterListener();
    this.mapConfig = this.sessionService.getMapConfigurations();

    const currentLayer =
      mapHelper.getMapLayers().baselayers[this.mapConfig.default_view!.baselayer];

    this.leafletOptions = {
      minZoom: 1,
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
    this.getPostsGeoJson();
  }

  private initFilterListener() {
    this.filtersSubscription$.pipe(debounceTime(1000)).subscribe({
      next: (filter) => {
        if (this.route.snapshot.data['view'] === 'search' && !this.searchId) return;
        if (this.route.snapshot.data['view'] === 'collection' && !this.collectionId) return;

        this.getPostsGeoJson(1, filter);
      },
    });
  }

  private reInitParams() {
    this.params.page = 1;
    this.params.limit = 500;
    this.params.currentView = 'map';
    this.resetMapLayers();
    this.mapLayers = [];
  }

  private resetMapLayers() {
    this.mapLayers.map((layer) => {
      this.map.removeLayer(layer);
      this.markerClusterData.removeLayer(layer);
    });
  }

  onMapReady(map: Map) {
    this.map = map;

    // Fix initial zoom flicker of map view's map when bounds exist in local storage
    const bounds = localStorage.getItem('bounds');
    if (bounds === null) {
      this.map.setZoom(this.leafletOptions.zoom ?? this.leafletOptions.minZoom ?? 1);
    } else {
      const { fit, zoom, center } = JSON.parse(bounds as string);
      this.map.setMaxBounds(fit);
      this.map.setView([center.lat, center.lng], zoom, {
        animate: false,
      });
    }
    // Later TODO: Check -> Does this check take care of when there are no posts with location info in deployment (at the time when bounds is null)?
    //---------------------

    control.zoom({ position: 'bottomleft' }).addTo(map);
  }

  getPostsGeoJson(pageNumber: number = 1, filter?: any) {
    this.postsService
      .getGeojson({ ...this.params, page: pageNumber })
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

          // Do we have any markers (layers) at all?
          const isFirstLayerEmpty = this.mapLayers.length === 0;

          // Do the number of markers equal what we expect?
          const isLayerCountMismatch =
            pageNumber > 1 &&
            !isFirstLayerEmpty &&
            this.mapLayers[0].getLayers().length !== geoPosts.getLayers().length;

          // Is the client in the middle of retrieving multiple pages of markers?
          const isThisInProgress =
            pageNumber > 1 && posts.meta.total !== geoPosts.getLayers().length;

          // Has the filter changed from when we last saw it?
          const currentFilter: string | undefined = filter
            ? JSON.stringify(filter)
            : this.cachedFilter;
          const hasTheFilterChanged = this.cachedFilter && currentFilter !== this.cachedFilter;
          this.cachedFilter = currentFilter;

          if (
            isFirstLayerEmpty ||
            hasTheFilterChanged ||
            isThisInProgress ||
            isLayerCountMismatch
          ) {
            if (!isFirstLayerEmpty && !isThisInProgress) {
              this.resetMapLayers();
            }

            if (this.mapConfig.clustering) {
              this.markerClusterData.addLayer(geoPosts);
              this.mapLayers.push(this.markerClusterData);
            } else {
              this.mapLayers.push(geoPosts);
            }

            if (
              this.params.limit &&
              pageNumber &&
              posts.meta.total > this.params.limit * pageNumber
            ) {
              this.progress = ((this.params.limit * pageNumber) / posts.count) * 100;
              pageNumber++;
              this.getPostsGeoJson(pageNumber, filter);
            } else {
              this.progress = 100;
              if (posts.results.length) {
                this.mapFitToBounds = geoPosts.getBounds();

                // Save bounds to localstorage to fix flicker when map is ready
                const bounds = {
                  fit: this.mapFitToBounds,
                  zoom: this.map.getBoundsZoom(this.mapFitToBounds),
                  center: this.map.getCenter(),
                };
                localStorage.setItem('bounds', JSON.stringify(bounds));
              }
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
