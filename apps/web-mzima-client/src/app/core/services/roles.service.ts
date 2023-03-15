import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RoleResponse, RoleResult } from '@models';
import { Observable } from 'rxjs';
import { EnvService } from './env.service';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class RolesService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient, protected override env: EnvService) {
    super(httpClient, env);
  }

  getApiVersions(): string {
    return this.env.environment.api_v3;
  }

  getResourceUrl(): string {
    return 'roles';
  }

  override get(): Observable<RoleResponse> {
    return super.get();
  }

  override getById(id: string): Observable<RoleResult> {
    return super.getById(id);
  }

  override update(id: string | number, role: RoleResult): Observable<RoleResult> {
    return super.update(id, role);
  }

  override delete(id: string | number): Observable<any> {
    return super.delete(id);
  }
}
