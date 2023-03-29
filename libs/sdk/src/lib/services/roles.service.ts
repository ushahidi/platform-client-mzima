import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiHelpers } from '../helpers';
import { EnvLoader } from '../loader';
import { RolesResponse, RoleResult, RoleResponse } from '../models';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class RolesService extends ResourceService<any> {
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
    return 'roles';
  }

  getRoles(): Observable<RolesResponse> {
    return super.get();
  }

  getRoleById(id: string): Observable<RoleResponse> {
    return super.getById(id);
  }

  updateRole(id: string | number, role: RoleResult): Observable<RoleResult> {
    return super.update(id, role);
  }

  deleteRole(id: string | number): Observable<any> {
    return super.delete(id);
  }
}
