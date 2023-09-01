import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { STORAGE_KEYS } from '@constants';
import { catchError, forkJoin, lastValueFrom, map, Observable, tap, throwError } from 'rxjs';
import { SessionConfigInterface } from '@models';
import { DatabaseService } from './database.service';
import { SessionService } from './session.service';
import { EnvService } from './env.service';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(
    protected httpClient: HttpClient,
    private env: EnvService,
    private sessionService: SessionService,
    private databaseService: DatabaseService,
    private storageService: StorageService,
  ) {}

  getApiVersions(): string {
    return this.env.environment.api_v5;
  }

  getResourceUrl(): string {
    return 'config';
  }

  getConfig(): Observable<any> {
    const configKeys: (keyof SessionConfigInterface)[] = ['site', 'features', 'map'];
    return this.httpClient
      .get(`${this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()}`)
      .pipe(
        tap({
          next: (data: any) => {
            configKeys.forEach((key) => {
              const config = data.results.find((result: any) => result.id === key);
              if (config) {
                this.setConfigurations('set', key, config);
              }
            });
          },
          error: () => {
            configKeys.forEach((key) => {
              this.setConfigurations('get', key);
            });
            setTimeout(() => this.getConfig(), 5000);
          },
        }),
        catchError((response: HttpErrorResponse) => {
          if (response.status === 401) {
            this.storageService.deleteStorage(STORAGE_KEYS.DEPLOYMENT);
          }
          return throwError(() => response);
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

  initAllConfigurations(): Promise<any> {
    if (navigator.onLine) {
      return lastValueFrom(this.getConfig());
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
