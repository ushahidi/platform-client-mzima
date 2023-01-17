import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { CONST } from '@constants';
import { Roles } from '@enums';

@Injectable({
  providedIn: 'root',
})
export class HostGuard implements CanActivate {
  canActivate(): boolean {
    const role = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}role`);
    const hostRoles = [
      Roles.ADMIN,
      Roles.MANAGE_USERS,
      Roles.MANAGE_SETTINGS,
      Roles.MANAGE_IMPORT_EXPORT,
    ];
    return hostRoles.includes(<Roles>role);
  }
}
