import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Permissions } from '@enums';
import { generalHelpers } from '@mzima-client/sdk';

@Injectable({
  providedIn: 'root',
})
export class ManageUsersGuard implements CanActivate {
  canActivate(): boolean {
    const permissions = localStorage.getItem(
      `${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}permissions`,
    );
    return !!permissions?.includes(Permissions.ManageUsers);
  }
}
