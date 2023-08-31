import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
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

  public setDeployments(data: Deployment[]) {
    this.storageService.setStorage(STORAGE_KEYS.DEPLOYMENTS, data, 'array');
  }

  public addDeployments(data: Deployment[]) {
    const deployments = this.storageService.getStorage(STORAGE_KEYS.DEPLOYMENTS, 'array');
    const uniqueData: Deployment[] = this.getUniqueItems(data, deployments);
    const filteredArray: Deployment[] = this.removeDuplicates([...uniqueData, ...deployments]);
    this.storageService.setStorage(STORAGE_KEYS.DEPLOYMENTS, filteredArray, 'array');
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

  public setDeployment(data: Deployment) {
    this.resetData();
    this.storageService.setStorage(STORAGE_KEYS.DEPLOYMENT, data, 'object');
    this.deployment.next(data);
  }

  public getDeployment(): Deployment {
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

  private resetData(): void {
    localStorage.removeItem(this.sessionService.getLocalStorageNameMapper('filters'));
    localStorage.removeItem(this.sessionService.getLocalStorageNameMapper('allSurveysChecked'));
    this.databaseService.clear();
  }
}
