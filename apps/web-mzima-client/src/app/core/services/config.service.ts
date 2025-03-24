import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SessionConfigInterface } from '@models';
import { lastValueFrom, map, Observable, tap } from 'rxjs';
import { SessionService } from './session.service';
import { EnvService } from './env.service';
import _ from 'lodash';

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
    return this.env.environment.api_v5;
  }

  getResourceUrl(): string {
    return 'config';
  }

  update(id: string | number, resource: any) {
    return this.httpClient.put(
      `${this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()}/${id}`,
      resource,
    );
  }

  private getConfig(): Observable<any> {
    return this.httpClient
      .get(`${this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()}`)
      .pipe(
        tap({
          next: (data: any) => {
            const configKeys: (keyof SessionConfigInterface)[] = ['site', 'features', 'map'];
            configKeys.forEach((key) => {
              const config = data.results.find((result: any) => result.id === key);
              if (config) {
                this.sessionService.setConfigurations(key, config);
              }
            });
            return data.result;
          },
          error: (error) => {
            if (error.status === 404 && error.error.errors[0].message === 'Deployment not found')
              this.sessionService.configLoaded = true;
            else setTimeout(() => this.getConfig(), 5000);
          },
        }),
      );
  }

  initAllConfigurations(): Promise<any> {
    return lastValueFrom(this.getConfig()).catch(() => {
      lastValueFrom(this.getConfig()); // Retry call config after clearing 401
    });
  }

  public getProvidersData(dataSources?: any): Observable<any> {
    return this.httpClient
      .get<any>(
        `${
          this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()
        }/data-provider`,
      )
      .pipe(
        map((data) => {
          //-------------------------------------------------
          // Simulating adding supported prop from backend
          //-------------------------------------------------
          const supportedDataSources = (dataSource: any) => {
            const supported = data.results.filter(
              (result: any) =>
                result['provider-name'] === 'africastalking' ||
                result['provider-name'] === 'mteja' ||
                result['provider-name'] === 'httpsms' ||
                result['provider-name'] === 'infobip' ||
                result['provider-name'] === 'sislog',
            );
            return supported.filter((test: any) => test['provider-name'] === dataSource.id)[0];
          };
          //-------------------------------------------------
          return dataSources
            .filter(
              (dataSource: any) =>
                data.results.findIndex((result: any) => dataSource.id === result['provider-name']) >
                -1,
            )
            .map((dataSource: any) => {
              //-------------------------------------------------------------
              // Simulating change of "retired" datasource names from backend
              //-------------------------------------------------------------
              if (dataSource.name === 'FrontlineSMS')
                dataSource.name = 'FrontlineSMS (shutdown & leaving soon)';
              if (dataSource.name === 'SMSSync') dataSource.name = 'SMSSync (No longer maintained)';
              //-------------------------------------------------
              // Simulating adding configured prop from backend
              //-------------------------------------------------
              const isConfigured = () => {
                const providerList = data.results.find(
                  (result: any) => dataSource.id === result['provider-name'],
                );
                const isDefaultParamsOrNot = ({ provider }: { provider: any }) => {
                  const isAnArray = Array.isArray(provider.params);
                  const isParamsArrayAndEmpty = isAnArray && !provider.params.length;

                  let configured = !isParamsArrayAndEmpty;

                  if (provider['provider-name'] === 'email') {
                    const unconfiguredValues = {
                      incoming_last_uid: '0',
                      incoming_password: '',
                      incoming_port: '',
                      incoming_security: '',
                      incoming_server: '',
                      incoming_type: '',
                      incoming_unread_only: 'Unread',
                      incoming_username: '',
                    };

                    configured = !_.isEqual(unconfiguredValues, provider.params);
                  }

                  if (provider['provider-name'] === 'smssync') {
                    const unconfiguredValues = {
                      id: 'smssync',
                      intro_step1: null,
                      intro_step2: null,
                      secret: 'SECRET',
                    };
                    configured = isParamsArrayAndEmpty
                      ? isParamsArrayAndEmpty
                      : !_.isEqual(unconfiguredValues, provider.params);
                  }

                  return configured;
                };

                const configured = isDefaultParamsOrNot({ provider: providerList });
                return configured;
              };
              //-------------------------------------------------
              return {
                ...dataSource,
                supported: !!supportedDataSources(dataSource),
                configured: isConfigured(),
                enabled: data.results.find(
                  (result: any) => dataSource.id === result['provider-name'],
                ).enabled,
                params: data.results.find(
                  (result: any) => dataSource.id === result['provider-name'],
                ).params,
                options: dataSource.options.map((option: any) => ({
                  ...option,
                  value: data.results.find(
                    (result: any) => dataSource.id === result['provider-name'],
                  ).params[option.id],
                })),
              };
            });
        }),
      );
  }

  public getAllProvidersData(): Observable<any> {
    return this.httpClient.get<any>(
      `${
        this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()
      }/data-provider`,
    );
  }

  // public getProvidersData(isAllData = false, dataSources?: any): Observable<any> {
  //   return this.httpClient
  //     .get<any>(
  //       `${
  //         this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()
  //       }/data-provider`,
  //     )
  //     .pipe(
  //       map((data) => {
  //         let providers: any[] = [];
  //         delete data.result['id'];
  //         delete data.result['allowed_privileges'];
  //         for (const dataKey in data.result) {
  //           if (dataSources?.length) {
  //             for (const { id } of dataSources) {
  //               if (dataKey === id) {
  //                 providers = [...providers, this.addToProviderSArray(dataKey, data.result)];
  //               }
  //             }
  //           } else {
  //             providers = [...providers, this.addToProviderSArray(dataKey, data.result)];
  //           }
  //         }
  //         return isAllData ? data.result : providers;
  //       }),
  //     );
  // }

  public updateProviders(providers: any): Observable<any> {
    return this.httpClient.put(
      `${
        this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()
      }/data-provider`,
      providers,
    );
  }
  public updateProviderById(id: string, provider: any): Observable<any> {
    return this.httpClient.put(
      `${
        this.env.environment.backend_url + this.getApiVersions() + this.getResourceUrl()
      }/data-provider/${id}`,
      provider,
    );
  }

  private addToProviderSArray(dataKey: string, data: any) {
    return {
      label: data[dataKey]['provider-name'],
      value: data[dataKey].enabled,
    };
  }
}
