import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Observable } from 'rxjs';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { MapConfigInterface } from '@models';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import Overlay from 'ol/Overlay';

import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MainViewComponent } from '@shared';
import {
  MediaService,
  SavedsearchesService,
  PostsService,
  GeoJsonPostsResponse,
} from '@mzima-client/sdk';
import GeoJSON from 'ol/format/GeoJSON';

import { SessionService, EventBusService, EventType, BreakpointService } from '@services';

import { fromLonLat } from 'ol/proj';
@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent extends MainViewComponent implements OnInit {
  map: Map;
  mapConfig: MapConfigInterface;
filtersSubscription$: Observable<any>;
 surveyLayer!: VectorLayer;

  constructor(
    protected override router: Router,
        protected override route: ActivatedRoute,
        protected override postsService: PostsService,
        protected override savedSearchesService: SavedsearchesService,
        protected override eventBusService: EventBusService,
        protected override sessionService: SessionService,
        protected override breakpointService: BreakpointService,
  ) {
    super(router, route, postsService, savedSearchesService, eventBusService, sessionService, breakpointService);
    this.filtersSubscription$ = this.postsService.postsFilters$.pipe(untilDestroyed(this));
  }
  ngOnInit(): void {    
    this.initFilterListener();
    this.mapConfig = this.sessionService.getMapConfigurations();
    const center = [this.mapConfig.default_view?.lon || 0, this.mapConfig.default_view?.lat || 0];
    const view = new View({
      center: fromLonLat(center),
      zoom: 4,
    });
    this.map = new Map({
      view: view,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      target: 'ol-map',
    });
    this.initiatePopups();
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

  getPostsGeoJson(pageNumber: number = 1, filter?: any) {
    this.postsService
      .getGeojson({limit: 500, currentView: 'map', page: pageNumber })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (posts: GeoJsonPostsResponse) => {
          const oldGeoJson: any = posts.results.map((r: any) => 
            r.geojson.features.map((f: any) => ({
              type: 'Feature',
              properties: {
                data_source_message_id: r.data_source_message_id,
                description: r.description,
                id: r.id,
                color: r['marker-color'],
                source: r.source,
                title: r.title,
              },
              geometry: f.geometry
            }))
          ).flat();
          const geoJson = {
            type: 'FeatureCollection',
            features: oldGeoJson
          };
          const style = (feature: any) => {
            const color = feature.getProperties().color ? `#${feature.getProperties().color}` : '#ffff';
            return new Style({
              image: new CircleStyle({
                fill: new Fill({ color }),
                radius: 5,
              }),
            });
          };
          const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(geoJson, {
              featureProjection: 'EPSG:3857',
            }),
          });
          
          this.surveyLayer = new VectorLayer({
            source: vectorSource,
            style: style,
          });
          this.map.addLayer(this.surveyLayer)
      },
      error: (error) => {
        console.error('Error loading posts geojson', error);
      }
    });
  }

  initiatePopups() {
    const container = document.getElementById('popup');
    const content = document.getElementById('popup-content');
    const closer = document.getElementById('popup-closer');

    if (!container || !content || !closer) return;

    const overlay = new Overlay({
      element: container,
      autoPan: {
      animation: {
        duration: 250,
      },
      },
    });

    closer.onclick = () => {
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    this.map.addOverlay(overlay);

    this.map.on('click', (evt) => {
      const coordinate = evt.coordinate;
      const viewResolution = this.map.getView().getResolution(); 
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feature: any, layer: any) => {
        return layer === this.surveyLayer ? feature : null;
      });
      if (feature) {
        const { title, description, color } = feature.getProperties();
        container.style.borderLeft = `10px solid #${color || 'fff'}`;
        content.innerHTML = `<h3>${title}</h3><p>${description}</p>`;
        overlay.setPosition(coordinate);
      } else {
        overlay.setPosition(undefined);
      }
    });

  }
}
