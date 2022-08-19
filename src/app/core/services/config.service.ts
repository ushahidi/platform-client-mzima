import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { MapConfigInterface } from '@models';
import { mergeMap, Observable, tap } from 'rxjs';
import { ResourceService } from './resource.service';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, private sessionService: SessionService) {
    super(httpClient);
  }

  getApiVersions(): string {
    return environment.api_v3;
  }

  getResourceUrl(): string {
    return 'config';
  }

  getSite(): Observable<any> {
    return super.get('site').pipe(
      tap((data) => {
        this.sessionService.setConfigurations('site', data);
      }),
    );
  }

  getFeatures(): Observable<any> {
    return super.get('features').pipe(
      tap((data) => {
        this.sessionService.setConfigurations('features', data);
      }),
    );
  }

  getMap(): Observable<MapConfigInterface> {
    return super.get('map');
  }

  initAllConfigurations() {
    return this.getSite().pipe(
      mergeMap(() => {
        return this.getFeatures();
      }),
    );
  }
}
