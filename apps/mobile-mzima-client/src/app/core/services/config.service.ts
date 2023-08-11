import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '@constants';
import { forkJoin, lastValueFrom, map, Observable, tap } from 'rxjs';
import { MapConfigInterface } from '@models';
import { DatabaseService } from './database.service';
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
    private databaseService: DatabaseService,
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
        tap({
          next: (data) => {
            this.setConfigurations('set', STORAGE_KEYS.SITE, data);
          },
          error: () => {
            this.setConfigurations('get', STORAGE_KEYS.SITE);
            setTimeout(() => this.getSite(), 5000);
          },
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
        tap({
          next: (data) => {
            this.setConfigurations('set', STORAGE_KEYS.FEATURES, data);
          },
          error: () => {
            this.setConfigurations('get', STORAGE_KEYS.FEATURES);
            setTimeout(() => this.getFeatures(), 5000);
          },
        }),
      );
  }

  getMap(): Observable<MapConfigInterface> {
    return this.httpClient
      .get<MapConfigInterface>(
        `${this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()}/map`,
      )
      .pipe(
        tap({
          next: (data) => {
            if (data.default_view?.baselayer === 'MapQuest') {
              data.default_view.baselayer = 'streets';
            }
            if (data.default_view?.baselayer === 'MapQuestAerial') {
              data.default_view.baselayer = 'satellite';
            }
            this.setConfigurations('set', STORAGE_KEYS.MAP, data);
          },
          error: () => {
            this.setConfigurations('get', STORAGE_KEYS.MAP);
            setTimeout(() => this.getMap(), 5000);
          },
        }),
      );
  }

  private async setConfigurations(action: string, key: any, data?: any) {
    let config = data;
    if (action === 'set') {
      await this.databaseService.set(key, config);
    } else {
      config = await this.databaseService.get(key);
    }
    this.sessionService.setConfigurations(key, config);
    return config;
  }

  update(id: string | number, resource: any) {
    return this.httpClient.put(
      `${this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()}/${id}`,
      resource,
    );
  }

  initAllConfigurations() {
    if (navigator.onLine) {
      return lastValueFrom(forkJoin([this.getSite(), this.getFeatures(), this.getMap()]));
    } else {
      return lastValueFrom(
        forkJoin([
          this.setConfigurations('get', STORAGE_KEYS.SITE),
          this.setConfigurations('get', STORAGE_KEYS.FEATURES),
          this.setConfigurations('get', STORAGE_KEYS.MAP),
        ]),
      );
    }
  }

  public getProvidersData(isAllData = false, dataSources?: any): Observable<any> {
    return this.httpClient
      .get<any>(
        `${
          this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()
        }/data-provider`,
      )
      .pipe(
        map((data) => {
          let providers: any[] = [];
          for (const dataKey in data.providers) {
            if (dataSources?.length) {
              for (const { id } of dataSources) {
                if (dataKey === id) {
                  providers = [...providers, this.addToProviderSArray(dataKey, data)];
                }
              }
            } else {
              providers = [...providers, this.addToProviderSArray(dataKey, data)];
            }
          }
          return isAllData ? data : providers;
        }),
      );
  }

  public updateProviders(providers: any): Observable<any> {
    return this.httpClient.put(
      `${
        this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()
      }/data-provider`,
      providers,
    );
  }

  private addToProviderSArray(dataKey: string, data: any) {
    return {
      label: dataKey.toLowerCase(),
      value: data.providers[dataKey],
    };
  }
}
