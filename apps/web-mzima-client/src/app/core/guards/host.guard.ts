import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { CONST } from '@constants';
import { Permissions, Roles } from '@enums';

@Injectable({
  providedIn: 'root',
})
export class HostGuard implements CanActivate {
  canActivate(): boolean {
    const hostRoles: any[] = [
      Permissions.ManageUsers,
      Permissions.ManageSettings,
      Permissions.ImportExport,
    ];

    const role = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}role`);
    const permissions = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}permissions`);
    return !!permissions?.split(',').some((p) => hostRoles.includes(p)) || role === Roles.Admin;
  }
}
