import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PermissionResult } from '@models';
import { Observable } from 'rxjs';
import { ResourceService } from './resource.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsService extends ResourceService<PermissionResult> {
  constructor(protected override httpClient: HttpClient) {
    super(httpClient);
  }

  getResourceUrl(): string {
    return 'permissions';
  }

  override get(): Observable<PermissionResult> {
    return super.get();
  }
}
