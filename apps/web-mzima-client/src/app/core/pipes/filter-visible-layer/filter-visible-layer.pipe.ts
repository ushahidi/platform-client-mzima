import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterVisibleLayers' })
export class FilterVisibleLayersPipe implements PipeTransform {
  transform(layers: any[]) {
    return layers.filter((layer) => layer.visible);
  }
}
