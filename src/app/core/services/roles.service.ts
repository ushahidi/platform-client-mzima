import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { RoleResult } from '@models';
import { Observable } from 'rxjs';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class RolesService extends ResourceService<RoleResult> {
  constructor(protected override httpClient: HttpClient) {
    super(httpClient);
  }

  getApiVersions(): string {
    return environment.api_v3;
  }

  getResourceUrl(): string {
    return 'roles';
  }

  override get(): Observable<RoleResult> {
    return super.get();
  }

  override getById(id: string | number): Observable<RoleResult> {
    return super.getById(id);
  }
}
