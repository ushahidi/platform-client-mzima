import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Permissions, Roles } from '@enums';
import { generalHelpers } from '@mzima-client/sdk';

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

    const role = localStorage.getItem(`${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}role`);
    const permissions = localStorage.getItem(
      `${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}permissions`,
    );
    return !!permissions?.split(',').some((p) => hostRoles.includes(p)) || role === Roles.Admin;
  }
}
