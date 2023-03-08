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
      Roles.Admin,
      Roles.ManageUsers,
      Roles.ManageSettings,
      Roles.ManageImportExport,
    ];
    return hostRoles.includes(<Roles>role);
  }
}
