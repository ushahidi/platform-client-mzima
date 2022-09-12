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
import { ConfigService, PostsService, PostsV5Service } from '@services';
import { GeoJsonPostsResponse, MapConfigInterface } from '@models';
import { mapHelper } from '@helpers';
import { PostComponent } from '../shared/components/post/post.component';
import { ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PostDetailsModalComponent } from './post-details-modal/post-details-modal.component';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
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

  public leafletOptions: MapOptions;

  constructor(
    private postsService: PostsService,
    private postsV5Service: PostsV5Service,
    private view: ViewContainerRef,
    private configService: ConfigService,
    private dialog: MatDialog,
    private zone: NgZone,
  ) {}

  ngOnInit() {
    this.configService.getMap().subscribe({
      next: (mapConfig) => {
        this.mapConfig = mapConfig;

        const currentLayer = mapHelper.getMapLayers().baselayers[mapConfig.default_view.baselayer];

        this.leafletOptions = {
          scrollWheelZoom: true,
          zoomControl: false,
          layers: [tileLayer(currentLayer.url, currentLayer.layerOptions)],
          center: [mapConfig.default_view.lat, mapConfig.default_view.lon],
          zoom: mapConfig.default_view.zoom,
        };
        this.markerClusterOptions.maxClusterRadius = mapConfig.cluster_radius;

        this.mapReady = true;
        this.getPostsGeoJson();
      },
    });
  }

  onMapReady(map: Map) {
    control.zoom({ position: 'bottomleft' }).addTo(map);
  }

  getPostsGeoJson() {
    this.postsService.getGeojson().subscribe((posts) => {
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
                const comp = this.view.createComponent(PostComponent);
                this.postsV5Service.getById(feature.properties.id).subscribe({
                  next: (post) => {
                    comp.setInput('post', post);

                    const popup: Content = comp.location.nativeElement;

                    layer.bindPopup(popup, {
                      maxWidth: 360,
                      minWidth: 360,
                      maxHeight: 320,
                      closeButton: false,
                      className: 'pl-popup',
                    });
                    layer.openPopup();

                    comp.instance.details$.subscribe({
                      next: () => {
                        this.showPostDetailsModal(post);
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

      this.mapFitToBounds = geoPosts.getBounds();
    });
  }

  private showPostDetailsModal(post: any): void {
    this.dialog.open(PostDetailsModalComponent, {
      width: '100%',
      maxWidth: 640,
      data: { post },
      height: 'auto',
      maxHeight: '90vh',
    });
  }
}
