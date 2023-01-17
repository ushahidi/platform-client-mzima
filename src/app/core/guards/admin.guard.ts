import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { CONST } from '@constants';
import { Roles } from '@enums';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  canActivate(): boolean {
    const role = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}role`);
    return role === Roles.ADMIN;
  }
}
