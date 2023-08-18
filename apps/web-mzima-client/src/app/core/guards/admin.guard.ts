import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Roles } from '@enums';
import { generalHelpers } from '@mzima-client/sdk';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  canActivate(): boolean {
    const role = localStorage.getItem(`${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}role`);
    return role === Roles.Admin;
  }
}
