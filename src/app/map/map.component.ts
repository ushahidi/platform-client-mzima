import { Component, OnInit } from '@angular/core';
import {
  latLng,
  tileLayer,
  geoJSON,
  FitBoundsOptions,
  LatLngBounds,
  FeatureGroup,
  Content,
  MarkerClusterGroup,
  MarkerClusterGroupOptions,
  MapOptions,
} from 'leaflet';
import { PostsService } from '@services';
import { GeoJsonPostsResponse } from '@models';
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
  markerClusterData = new MarkerClusterGroup();
  markerClusterOptions: MarkerClusterGroupOptions = { animate: true, maxClusterRadius: 50 };
  mapFitToBounds: LatLngBounds;
  fitBoundsOptions: FitBoundsOptions = {
    animate: true,
  };

  public leafletOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,

        attribution: 'Coool',
      }),
    ],
    zoomControl: true,
    zoom: 5,
    maxBounds: [
      [-90, -360],
      [90, 360],
    ],
    center: latLng(46.879966, -121.726909),
  };

  constructor(private postsService: PostsService, private view: ViewContainerRef) {}

  ngOnInit() {
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
                    maxHeight: 400,
                    className: 'pl-popup',
                  });
                  layer.openPopup();
                },
              });
            }
          });
        },
      });
      this.markerClusterData.addLayer(geoPosts);
      this.mapLayers.push(this.markerClusterData);
      this.mapFitToBounds = geoPosts.getBounds();
    });
  }
}
