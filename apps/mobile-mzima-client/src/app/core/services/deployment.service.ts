import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable } from 'rxjs';
import { getDeploymentAvatarPlaceholder } from '@helpers';
import { STORAGE_KEYS } from '@constants';
import { Deployment } from '@mzima-client/sdk';
import { DatabaseService, SessionService, StorageService } from '@services';

const DEPLOYMENTS_URL = 'https://api.ushahidi.io/deployments';

@Injectable({
  providedIn: 'root',
})
export class DeploymentService {
  public deployment = new BehaviorSubject<Deployment | null>(null);
  readonly deployment$ = this.deployment.asObservable();

  constructor(
    private httpClient: HttpClient,
    private storageService: StorageService,
    private sessionService: SessionService,
    private databaseService: DatabaseService,
  ) {
    this.deployment.next(this.storageService.getStorage(STORAGE_KEYS.DEPLOYMENT, 'object'));
  }

  public removeDomainForSearch(input: string): string {
    const parts = input.split('.');
    if (parts.length > 2) {
      parts.splice(-2, 2);
      return parts.join('.');
    }
    return input;
  }

  public searchDeployments(search: string): Observable<any> {
    const storeDeployments = this.getDeployments();

    try {
      return this.fetchBackendUrl(search).pipe(
        map((backend_url: string) => {
          const domain = backend_url.toLowerCase();
          console.log(domain);
          const isSelected = !!storeDeployments.find(
            (deployment: any) => deployment.domain === domain,
          );

          return [
            {
              id: this.generateRandomId(),
              domain: domain,
              deployment_name: search.toLowerCase(),
              selected: isSelected,
              avatar: getDeploymentAvatarPlaceholder(domain),
            },
          ];
        }),
      );
    } catch (error) {
      console.log(error);
      const params = new HttpParams().set('q', search);
      return this.httpClient.get<any[]>(DEPLOYMENTS_URL, { params }).pipe(
        map((deployments: any) =>
          deployments
            .filter((deployment: any) => deployment.status === 'deployed')
            .map((deployment: any) => {
              const isSelected = !!storeDeployments.find((item: any) => item.id === deployment.id);
              return {
                ...deployment,
                selected: isSelected,
                avatar: !deployment.image
                  ? getDeploymentAvatarPlaceholder(deployment.deployment_name)
                  : null,
              };
            }),
        ),
      );
    }
  }

  public setDeployments(data: Deployment[]) {
    this.storageService.setStorage(STORAGE_KEYS.DEPLOYMENTS, data, 'array');
  }

  public addDeployments(data: Deployment[]) {
    const deployments = this.getDeployments();
    const uniqueData: Deployment[] = this.getUniqueItems(data, deployments);
    const filteredArray: Deployment[] = this.removeDuplicates([...uniqueData, ...deployments]);
    console.log('addDeployments', filteredArray);
    this.storageService.setStorage(STORAGE_KEYS.DEPLOYMENTS, filteredArray, 'array');
  }

  public updateDeployment(deploymentId: number | string, data: Partial<Deployment>) {
    const deployments: Deployment[] = this.storageService.getStorage(
      STORAGE_KEYS.DEPLOYMENTS,
      'array',
    );
    const index = deployments.findIndex((d) => d.id === deploymentId);
    if (index !== -1) {
      deployments[index] = {
        ...deployments[index],
        ...data,
      };
      this.storageService.setStorage(STORAGE_KEYS.DEPLOYMENTS, deployments, 'array');
    }
  }

  private getUniqueItems(data: Deployment[], deployments: Deployment[]): Deployment[] {
    return data.filter(
      (itemData: Deployment) =>
        !deployments.some((itemDeploy: Deployment) => itemData.id === itemDeploy.id),
    );
  }

  public removeDuplicates(deployments: Deployment[]): Deployment[] {
    return deployments.filter(
      (item, index, array) => index === array.findIndex((deployment) => deployment.id === item.id),
    );
  }

  public hasDuplicates(deployments: Deployment[]): boolean {
    return deployments.some(
      (item: Deployment, index: number, array: Deployment[]) =>
        array.findIndex((deployment) => deployment.id === item.id) !== index,
    );
  }

  public getDeployments(): any[] {
    return this.storageService.getStorage(STORAGE_KEYS.DEPLOYMENTS, 'array') || [];
  }

  public setDeployment(data: Deployment | null) {
    this.resetData();
    if (data) {
      this.storageService.setStorage(STORAGE_KEYS.DEPLOYMENT, data, 'object');
    } else {
      this.storageService.deleteStorage(STORAGE_KEYS.DEPLOYMENT);
    }
    this.deployment.next(data);
  }

  public getDeployment(): Deployment | null {
    return this.storageService.getStorage(STORAGE_KEYS.DEPLOYMENT, 'object');
  }

  public isDeployment(): boolean {
    return !!this.storageService.getStorage(STORAGE_KEYS.DEPLOYMENT);
  }

  public removeDeployment(): void {
    this.resetData();
    this.deployment.next(null);
    return this.storageService.deleteStorage(STORAGE_KEYS.DEPLOYMENT);
  }

  public fetchBackendUrl(keyword: string): Observable<string> {
    const url = this.convertToUrl(keyword);
    return this.httpClient.get<any>(`${url}/config.json`).pipe(
      map((response) => response.backend_url),
      catchError((error) => {
        console.error('Error fetching config:', error);
        return [];
      }),
    );
  }

  public convertToUrl(keyword: string): string {
    console.log('convertToURL', keyword);
    keyword = keyword.toLowerCase();

    // Simple regex to check if the keyword is a URL, FQDN, localhost or IP address
    const regexPattern =
      '^(https?:\\/\\/)?' + // Match the protocol (http or https), optional
      '(www\\.)?' + // Match 'www.', optional
      '(' + // Start of the group for main matching:
      '(localhost(:[0-9]{1,5})?)' + // Match 'localhost' with an optional port number
      '|' + // OR
      '([a-z0-9]+([-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,10})' + // Match a domain name (FQDN)
      '|' + // OR
      '((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}' + // Match the first three octets of an IPv4 address
      '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)' + // Match the last octet of an IPv4 address
      ')' +
      '(:[0-9]{1,5})?' + // Match an optional port number
      '(\\/.*)?' + // Match the optional rest of the URL (path, query, etc.)
      '$';
    if (
      !keyword.match(
        regexPattern,
        // /^(https?:\/\/)?(www\.)?((localhost(:[0-9]{1,5})?)|([a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5})|((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?))(:[0-9]{1,5})?(\/.*)?$/,
      )
    ) {
      throw new Error('Invalid keyword. Not a FQDN, URL, localhost, or IP address.');
    }

    // Check if keyword already includes http/https
    if (keyword.startsWith('http://') || keyword.startsWith('https://')) {
      return keyword;
    } else {
      return `https://${keyword}`;
    }
  }

  private resetData(): void {
    localStorage.removeItem(this.sessionService.getLocalStorageNameMapper('filters'));
    localStorage.removeItem(this.sessionService.getLocalStorageNameMapper('allSurveysChecked'));
    this.databaseService.clear();
  }

  private generateRandomId(length: number = 10): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  public isValidUrl(url: string): boolean {
    const urlPattern = new RegExp(
      '^(https?:\\/\\/)?' + // validate protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator

    return !!urlPattern.test(url);
  }
}
