import { Component, NgZone, OnInit, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import { MapConfigInterface } from '@models';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import Overlay from 'ol/Overlay';
import { mapHelper, searchFormHelper } from '@helpers';
import TileWMS from 'ol/source/TileWMS';
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
  MediaService,
} from '@mzima-client/sdk';
import GeoJSON from 'ol/format/GeoJSON';
import { SessionService, EventBusService, EventType, BreakpointService } from '@services';
import { fromLonLat } from 'ol/proj';
import { PostDetailsModalComponent } from './post-details-modal/post-details-modal.component';
import { PostPreviewComponent } from '../post/post-preview/post-preview.component';

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
  post: any;
  isPostLoading: boolean;
  waterBodies: TileLayer[];
  layers: LayerGroup[] = [];
  waterLayers: LayerGroup;
  rainfallLayer: LayerGroup;
  rainfall: TileLayer[];

  constructor(
    protected override router: Router,
    protected override route: ActivatedRoute,
    protected override postsService: PostsService,
    protected override savedSearchesService: SavedsearchesService,
    protected override eventBusService: EventBusService,
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private dialog: MatDialog,
    private view: ViewContainerRef,
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
    this.filtersSubscription$ = this.postsService.postsFilters$.pipe(untilDestroyed(this));
  }

  ngOnInit(): void {
    this.mapConfig = this.sessionService.getMapConfigurations();
    this.initBaseLayers();
    this.initWMSLayers();
    this.initMap();
    this.loadData();
  }

  initBaseLayers() {
    const baseLayers = mapHelper.getOpenLayersMapConfig().filter((layer) => layer.visible);
    const visibleLayer =
      baseLayers.find((layer) => layer.code === this.mapConfig.default_view?.baselayer)?.code ||
      'streets';
    const selectableLayers = baseLayers.map(
      (layer) =>
        new TileLayer({
          title: layer.name,
          type: 'base',
          visible: visibleLayer === layer.code,
          source: new XYZ({
            url: layer.url,
            maxZoom: 'maxZoom' in layer.layerOptions ? layer.layerOptions.maxZoom : undefined,
          }),
        } as BaseLayerOptions),
    );

    this.baseMaps = new LayerGroup({
      title: 'Base Maps',
      layers: selectableLayers,
    } as GroupLayerOptions);
    this.layers.push(this.baseMaps);
  }

  initWMSLayers() {
    const wmsWater = mapHelper.getWaterLayer();
    this.waterBodies = wmsWater.map((wms: any) => {
      const newLayer = new TileLayer({
        source: new TileWMS({
          url: wms.url,
          params: wms.params,
        }),
      });
      newLayer.setProperties({ title: wms.attribution });
      return newLayer;
    });

    this.waterLayers = new LayerGroup({
      title: 'Water bodies',
      layers: this.waterBodies,
      combine: false,
    } as GroupLayerOptions);
    this.layers.push(this.waterLayers);

    const wmsRainfall = mapHelper.getRainfallLayer();
    this.rainfall = wmsRainfall.map((wms: any) => {
      const newLayer = new TileLayer({
        source: new TileWMS({
          url: wms.url,
          params: wms.params,
        }),
      });
      newLayer.setProperties({ title: wms.attribution });
      return newLayer;
    });
    this.rainfallLayer = new LayerGroup({
      title: 'Rainfall',
      layers: this.rainfall,
      combine: false,
    } as GroupLayerOptions);
    this.layers.push(this.rainfallLayer);
  }

  initMap() {
    const center = [this.mapConfig.default_view?.lon || 0, this.mapConfig.default_view?.lat || 0];
    const view = new View({
      center: fromLonLat(center),
      zoom: this.mapConfig.default_view?.zoom || 2,
    });

    this.map = new Map({
      view: view,
      layers: this.layers,
      target: 'ol-map',
    });

    const layerSwitcher = new LayerSwitcher({
      reverse: true,
      groupSelectStyle: 'children',
      startActive: false,
      label: '',
      collapseLabel: '',
    });

    this.map.addControl(layerSwitcher);
    this.initiatePopups();
  }

  loadData(): void {
    const defaultFilters = searchFormHelper.DEFAULT_FILTERS_LOGGED_OUT;
    this.getPostsGeoJson(1, defaultFilters);
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getPostsGeoJson(pageNumber: number = 1, filter?: any) {
    this.postsService
      .getGeojson(filter)
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
                geometry: f.geometry,
              })),
            ),
          };

          const style = (feature: any) => {
            const color = feature.getProperties().color;
            const marker = mapHelper.imageIcon(color);
            return new Style({
              image: new Icon({
                src: marker,
                anchor: [0.5, 50],
                anchorXUnits: 'fraction',
                anchorYUnits: 'pixels',
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
        },
      });
  }

  initiatePopups() {
    const container = document.getElementById('popup');
    if (!container) return;

    const overlay = new Overlay({
      element: container,
      autoPan: { animation: { duration: 250 } },
      positioning: 'bottom-center',
      offset: [0, -10],
    });

    this.map.addOverlay(overlay);

    this.map.on('click', (evt) => {
      const coordinate = evt.coordinate;
      const feature = this.map.forEachFeatureAtPixel(evt.pixel, (feat, layer) =>
        layer === this.surveyLayer ? feat : null,
      );

      const comp = this.view.createComponent(PostPreviewComponent);

      if (feature) {
        this.isPostLoading = true;

        const { id } = feature.getProperties();
        if (id) {
          overlay.setElement(container);
          overlay.setPosition(coordinate);

          this.postsService.getById(id).subscribe({
            next: (post) => {
              this.post = post;
              comp.setInput('post', this.post);
              comp.setInput('user', this.user);
              overlay.setElement(comp.location.nativeElement);
              overlay.setPosition(coordinate);
              this.isPostLoading = false;

              this.postsService.getById(id).subscribe({
                next: (postV5) => {
                  comp.instance.details$.subscribe({
                    next: () =>
                      this.showPostDetailsModal(postV5, post.color, post.data_source_message_id),
                  });
                  comp.instance.edit.subscribe({
                    next: () =>
                      this.showPostDetailsModal(
                        postV5,
                        post.color,
                        post.data_source_message_id,
                        true,
                      ),
                  });
                  comp.instance.deleted$.subscribe({
                    next: () => {
                      overlay.setPosition(undefined);
                      overlay.setElement(undefined);
                      comp.destroy();
                      this.map.removeLayer(this.surveyLayer);

                      this.loadData();
                      this.eventBusService.next({
                        type: EventType.RefreshSurveysCounters,
                        payload: true,
                      });
                    },
                  });
                },
              });
            },
            error: (error) => console.error('Error fetching post details', error),
          });
        }
      } else {
        overlay.setPosition(undefined);
        overlay.setElement(undefined);
        comp.destroy();
      }
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
