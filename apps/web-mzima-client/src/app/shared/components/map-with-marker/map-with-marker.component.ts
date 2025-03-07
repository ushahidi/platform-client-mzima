import { Component, Input, OnInit } from '@angular/core';
import { mapHelper } from '@helpers';
import { MapConfigInterface } from '@models';
import Map from 'ol/Map';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import Icon from 'ol/style/Icon';
import { SessionService } from '../../../core/services/session.service';

@Component({
  selector: 'app-map-with-marker',
  templateUrl: './map-with-marker.component.html',
  styleUrls: ['./map-with-marker.component.scss'],
})
export class MapWithMarkerComponent implements OnInit {
  @Input() public marker: { lat: number; lon: number };
  @Input() public color = 'var(--color-neutral-100)';
  @Input() public type = 'default';

  public mapConfig: MapConfigInterface;
  private map: Map;
  private markerLayer: VectorLayer;

  constructor(private sessionService: SessionService) {}
  ngOnInit(): void {
    this.mapConfig = this.sessionService.getMapConfigurations();
    const baseLayer = mapHelper.getMapLayers().baselayers[this.mapConfig.default_view!.baselayer];
    const currentLayer = new TileLayer({
      visible: true,
      source: new XYZ({
        url: baseLayer.url,
        maxZoom: 'maxZoom' in baseLayer.layerOptions ? baseLayer.layerOptions.maxZoom : undefined,
      }),
    });
    const view = new View({
      center: fromLonLat([this.marker.lon, this.marker.lat]),
      zoom: this.mapConfig.default_view?.zoom || 2,
    });

    this.map = new Map({
      view: view,
      layers: [currentLayer],
      target: 'ol-map',
    });

    const marker = new Feature({
      geometry: new Point(fromLonLat([this.marker.lon, this.marker.lat])),
    });

    this.markerLayer = new VectorLayer({
      source: new VectorSource({
        features: [marker],
      }),
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: mapHelper.imageIcon(this.color),
        }),
      }),
    });
    this.map.addLayer(this.markerLayer);
  }
}
