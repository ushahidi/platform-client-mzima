import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { getRandomColor } from '@helpers';
import { STORAGE_KEYS } from '@constants';
import { StorageService } from './storage.service';

const DEPLOYMENTS_URL = 'https://api.ushahidi.io/deployments';

@Injectable({
  providedIn: 'root',
})
export class DeploymentService {
  constructor(private httpClient: HttpClient, private storageService: StorageService) {}

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
              image:
                deployment.image ||
                (deployment.deployment_name
                  ? `https://via.placeholder.com/150/${getRandomColor()}/FFFFFF?text=${deployment.deployment_name
                      .charAt(0)
                      .toUpperCase()}`
                  : 'default_image_url'),
              selected: isSelected,
            };
          }),
      ),
    );
  }

  public setDeployments(data: any[]) {
    this.storageService.setStorage(STORAGE_KEYS.DEPLOYMENTS, data, 'array');
  }

  public getDeployments(): any[] {
    return this.storageService.getStorage(STORAGE_KEYS.DEPLOYMENTS, 'array') || [];
  }

  public setDeployment(data: object) {
    this.storageService.setStorage(STORAGE_KEYS.DEPLOYMENT, data, 'object');
  }

  public getDeployment(): object {
    return this.storageService.getStorage(STORAGE_KEYS.DEPLOYMENT, 'object');
  }

  public isDeployment(): boolean {
    return !!this.storageService.getStorage(STORAGE_KEYS.DEPLOYMENT);
  }
}
