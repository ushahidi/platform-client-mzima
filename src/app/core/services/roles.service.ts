import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
