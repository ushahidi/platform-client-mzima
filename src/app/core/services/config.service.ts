import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MapConfigInterface } from '@models';
import { lastValueFrom, mergeMap, Observable, tap } from 'rxjs';
import { SessionService } from './session.service';
import { EnvService } from './env.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(
    protected httpClient: HttpClient,
    private env: EnvService,
    private sessionService: SessionService,
  ) {}

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'config';
  }

  getSite(): Observable<any> {
    return this.httpClient
      .get(
        `${this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()}/site`,
      )
      .pipe(
        tap((data) => {
          this.sessionService.setConfigurations('site', data);
        }),
      );
  }

  getFeatures(): Observable<any> {
    return this.httpClient
      .get(
        `${
          this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()
        }/features`,
      )
      .pipe(
        tap((data) => {
          this.sessionService.setConfigurations('features', data);
        }),
      );
  }

  getMap(): Observable<MapConfigInterface> {
    return this.httpClient.get<MapConfigInterface>(
      `${this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()}/map`,
    );
  }

  update(id: string | number, resource: any) {
    return this.httpClient.put(
      `${this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()}/${id}`,
      resource,
    );
  }

  initAllConfigurations() {
    return lastValueFrom(
      this.getSite().pipe(
        mergeMap(() => {
          return lastValueFrom(this.getFeatures());
        }),
      ),
    );
  }

  getProvidersData(): Observable<any> {
    return this.httpClient.get<MapConfigInterface>(
      `${
        this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()
      }/data-provider`,
    );
  }

  updateProviders(providers: any) {
    return this.httpClient.put(
      `${
        this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()
      }/data-provider`,
      providers,
    );
  }
}
