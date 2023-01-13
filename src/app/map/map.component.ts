import { Component, NgZone, OnInit } from '@angular/core';
import {
  control,
  tileLayer,
  geoJSON,
  FitBoundsOptions,
  LatLngBounds,
  FeatureGroup,
  Content,
  MarkerClusterGroup,
  MarkerClusterGroupOptions,
  MapOptions,
  Map,
} from 'leaflet';
import {
  EventBusService,
  EventType,
  MediaService,
  PostsService,
  PostsV5Service,
  SessionService,
} from '@services';
import { GeoJsonPostsResponse, MapConfigInterface } from '@models';
import { mapHelper, takeUntilDestroy$ } from '@helpers';
import { ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PostDetailsModalComponent } from './post-details-modal/post-details-modal.component';
import { PostPreviewComponent } from '../post/post-preview/post-preview.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  private params: any = {
    limit: 200,
    offset: 0,
  };
  public map: Map;
  collectionId = '';
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

  filtersSubscription$ = this.postsService.postsFilters$.pipe(takeUntilDestroy$());

  public leafletOptions: MapOptions;
  public progress = 0;
  public isFiltersVisible: boolean;

  constructor(
    private postsService: PostsService,
    private postsV5Service: PostsV5Service,
    private view: ViewContainerRef,
    private sessionService: SessionService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private zone: NgZone,
    private eventBusService: EventBusService,
    private mediaService: MediaService,
  ) {}

  ngOnInit() {
    this.route.params.subscribe(() => {
      this.initCollection();
    });

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

    this.filtersSubscription$.subscribe({
      next: () => {
        this.mapLayers.map((layer) => {
          this.map.removeLayer(layer);
          this.markerClusterData.removeLayer(layer);
        });

        this.mapLayers = [];

        this.getPostsGeoJson();
      },
    });

    this.eventBusService.on(EventType.SearchOptionSelected).subscribe({
      next: (option) => {
        this.map.setZoom(12);
        this.map.panTo({ lat: option.lat, lng: option.lon });
      },
    });

    this.sessionService.isFiltersVisible$.subscribe({
      next: (isFiltersVisible) => {
        setTimeout(() => {
          this.isFiltersVisible = isFiltersVisible;
        }, 1);
      },
    });
  }

  initCollection() {
    if (this.route.snapshot.data['view'] === 'collection') {
      this.collectionId = this.route.snapshot.paramMap.get('id')!;
      this.params.set = this.collectionId;
      this.postsService.applyFilters({ set: this.collectionId });
    } else {
      this.collectionId = '';
      this.params.set = '';
      this.postsService.applyFilters({ set: [] });
    }
  }

  onMapReady(map: Map) {
    this.map = map;
    control.zoom({ position: 'bottomleft' }).addTo(map);
  }

  getPostsGeoJson() {
    this.postsService.getGeojson(this.params).subscribe((posts) => {
      const geoPosts = geoJSON(posts, {
        pointToLayer: mapHelper.pointToLayer,
        onEachFeature: (feature, layer) => {
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

                    const popup: Content = comp.location.nativeElement;

                    layer.bindPopup(popup, {
                      maxWidth: 360,
                      minWidth: 360,
                      maxHeight: window.innerHeight - 176,
                      closeButton: false,
                      className: 'pl-popup',
                    });
                    layer.openPopup();

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
