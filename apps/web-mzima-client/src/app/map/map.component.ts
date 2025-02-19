import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { MapConfigInterface } from '@models';
import { SessionService } from '@services';
import { fromLonLat } from 'ol/proj';
@Component({
  selector: 'app-root',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
})
export class MapComponent implements OnInit {
  map: Map;
  mapConfig: MapConfigInterface;
  constructor(protected sessionService: SessionService) {}
  ngOnInit(): void {
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
    console.log(this.map.getView().getCenter());
  }
}
