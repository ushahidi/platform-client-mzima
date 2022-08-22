import { Component, OnInit } from '@angular/core';
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
import { ConfigService, PostsService } from '@services';
import { GeoJsonPostsResponse, MapConfigInterface } from '@models';
import { mapHelper } from '@helpers';
import { PostPopupComponent } from './post-popup/post-popup.component';
import { ViewContainerRef } from '@angular/core';

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
    private view: ViewContainerRef,
    private configService: ConfigService,
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
    const that = this;
    this.postsService.getGeojson().subscribe((posts) => {
      const geoPosts = geoJSON(posts, {
        pointToLayer: mapHelper.pointToLayer,
        onEachFeature(feature, layer) {
          layer.on('click', () => {
            if (layer instanceof FeatureGroup) {
              layer = layer.getLayers()[0];
            }

            if (layer.getPopup()) {
              layer.openPopup();
            } else {
              const comp = that.view.createComponent(PostPopupComponent);
              that.postsService.getById(feature.properties.id).subscribe({
                next: (post) => {
                  comp.setInput('data', post);
                  comp.changeDetectorRef.detectChanges();

                  const popup: Content = comp.location.nativeElement;

                  layer.bindPopup(popup, {
                    maxWidth: 600,
                    maxHeight: 200,
                    closeButton: false,
                    className: 'pl-popup',
                  });
                  layer.openPopup();
                },
              });
            }
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
}
