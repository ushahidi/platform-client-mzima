import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService extends ResourceService<any> {
  categoryErrors = new BehaviorSubject<any>([]);
  readonly categoryErrors$ = this.categoryErrors.asObservable();

  constructor(
    protected override httpClient: HttpClient,
    protected override currentLoader: EnvLoader,
  ) {
    super(httpClient, currentLoader);
  }

  getApiVersions(): string {
    return apiHelpers.API_V_5;
  }

  getResourceUrl(): string {
    return 'categories';
  }

  public getCategories(params: any) {
    return super.get('', params);
  }
}
