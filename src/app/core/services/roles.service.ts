import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments';
import { RoleResponse, RoleResult } from '@models';
import { Observable } from 'rxjs';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class RolesService extends ResourceService<any> {
  constructor(protected override httpClient: HttpClient) {
    super(httpClient);
  }

  getApiVersions(): string {
    return environment.api_v3;
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
