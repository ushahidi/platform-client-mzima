import { Component, NgZone, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { mapHelper, takeUntilDestroy$ } from '@helpers';
import { GeoJsonPostsResponse, MapConfigInterface } from '@models';
import { untilDestroyed } from '@ngneat/until-destroy';
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
import { Observable } from 'rxjs';
import { PostPreviewComponent } from '../post/post-preview/post-preview.component';
import { PostDetailsModalComponent } from './post-details-modal/post-details-modal.component';
import { PostsService } from '../core/services/posts.service';
import { SavedsearchesService } from '../core/services/savedsearches.service';
import { PostsV5Service } from '../core/services/posts.v5.service';
import { MediaService } from '../core/services/media.service';
import { SessionService, EventBusService, EventType } from '@services';


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
    private postsV5Service: PostsV5Service,
    private view: ViewContainerRef,
    private dialog: MatDialog,
    private zone: NgZone,
    private mediaService: MediaService,
  ) {
    super(router, route, postsService, savedSearchesService, eventBusService, sessionService);
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
      minZoom: 3,
      maxZoom: 17,
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

  private initFilterListener() {
    this.filtersSubscription$.subscribe({
      next: () => {
        if (this.route.snapshot.data['view'] === 'search' && !this.searchId) return;
        if (this.route.snapshot.data['view'] === 'collection' && !this.collectionId) return;

        this.params.offset = 0;
        this.mapLayers.map((layer) => {
          this.map.removeLayer(layer);
          this.markerClusterData.removeLayer(layer);
        });

        this.mapLayers = [];

        this.getPostsGeoJson();
      },
    });
  }

  onMapReady(map: Map) {
    this.map = map;
    control.zoom({ position: 'bottomleft' }).addTo(map);
  }

  getPostsGeoJson() {
    this.postsService.getGeojson(this.params).subscribe({
      next: (posts) => {
        const geoPosts = geoJSON(posts, {
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

                      this.postsV5Service.getById(feature.properties.id).subscribe({
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

                          const mediaField = postV5.post_content[0].fields.find(
                            (field: any) => field.type === 'media',
                          );
                          if (mediaField && mediaField.value?.value) {
                            this.mediaService.getById(mediaField.value.value).subscribe({
                              next: (media) => {
                                comp.setInput('media', media);
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

        if (posts.total > this.params.limit + this.params.offset) {
          this.progress = ((this.params.limit + this.params.offset) / posts.total) * 100;

          this.params.offset = this.params.limit + this.params.offset;
          this.getPostsGeoJson();
        } else {
          this.progress = 100;
        }

        if (posts.features.length && this.params.offset <= this.params.limit) {
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

  private showPostDetailsModal(post: any, color: string, twitterId?: string): void {
    this.dialog.open(PostDetailsModalComponent, {
      width: '100%',
      maxWidth: 576,
      data: { post, color, twitterId },
      height: 'auto',
      maxHeight: '90vh',
      panelClass: ['modal', 'post-modal'],
    });
  }
}
