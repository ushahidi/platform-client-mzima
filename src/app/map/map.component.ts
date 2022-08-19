import { Component, OnInit } from '@angular/core';
import {
  latLng,
  tileLayer,
  geoJSON,
  FitBoundsOptions,
  LatLngBounds,
  FeatureGroup,
  Content,
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
  mapFitToBounds: LatLngBounds;
  fitBoundsOptions: FitBoundsOptions = {
    animate: true,
  };
  public leafletOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Coool',
      }),
    ],
    zoom: 5,
    center: latLng(46.879966, -121.726909),
  };

  constructor(private postsService: PostsService, private view: ViewContainerRef) {}

  ngOnInit() {
    const comp = this.view.createComponent(PostPopupComponent);

    this.postsService.getGeojson().subscribe((posts) => {
      const test = geoJSON(posts, {
        pointToLayer: mapHelper.pointToLayer,
        onEachFeature(feature, layer) {
          layer.on('click', () => {
            // Grab the layer that was actually clicked on
            // var layer: Layer = e.layer;

            // If we somehow got the feature group: grab the first child
            // because the FeatureGroup doesn't get added to the map when clustering
            if (layer instanceof FeatureGroup) {
              layer = layer.getLayers()[0];
            }

            if (layer.getPopup()) {
              layer.openPopup();
            } else {
              comp.setInput('data', feature.properties);
              comp.changeDetectorRef.detectChanges();

              const popup: Content = comp.location.nativeElement;
              layer.bindPopup(popup, {
                maxWidth: 600,
                maxHeight: 400,
                className: 'pl-popup',
              });
              layer.openPopup();
            }
          });
        },
      });
      this.mapLayers.push(test);
      this.mapFitToBounds = test.getBounds();
    });
  }
}
