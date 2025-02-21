import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, Observable } from 'rxjs';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { MapConfigInterface } from '@models';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import Overlay from 'ol/Overlay';
import { mapHelper } from '@helpers';
import XYZ from 'ol/source/XYZ';
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';
import LayerGroup from 'ol/layer/Group';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MainViewComponent } from '@shared';
import {
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
  baseMaps: LayerGroup;
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
    this.mapConfig = this.sessionService.getMapConfigurations();
    this.initFilterListener();
    this.initBaseLayers();
    this.initMap();
    this.loadData();
  }

  initBaseLayers() {
    const baseLayers = mapHelper.getOpenLayersMapConfig()
      .filter(layer => layer.visible)
      .map(layer => new TileLayer({
        title: layer.name,
        type: 'base',
        visible: this.mapConfig.default_view?.baselayer === layer.code,
        source: new XYZ({
          url: layer.url,
          maxZoom: 'maxZoom' in layer.layerOptions ? layer.layerOptions.maxZoom : undefined
        })
      } as BaseLayerOptions));

    this.baseMaps = new LayerGroup({
      title: 'Base Maps',
      layers: baseLayers,
    } as GroupLayerOptions);
  }

  initMap() {
    const center = [this.mapConfig.default_view?.lon || 0, this.mapConfig.default_view?.lat || 0];
    const view = new View({
      center: fromLonLat(center),
      zoom: this.mapConfig.default_view?.zoom || 2,
    });

    this.map = new Map({
      view: view,
      layers: [this.baseMaps],
      target: 'ol-map',
    });

    const layerSwitcher = new LayerSwitcher({
      reverse: true,
      groupSelectStyle: 'children',
      startActive: true,
      activationMode: 'click',
      label:'',
      collapseLabel: '',

      
    });

    this.map.addControl(layerSwitcher);
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
      .getGeojson({ limit: 500, currentView: 'map', page: pageNumber })
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (posts: GeoJsonPostsResponse) => {
          const geoJson = {
            type: 'FeatureCollection',
            features: posts.results.flatMap((r: any) =>
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
            )
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

          this.map.addLayer(this.surveyLayer);
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
