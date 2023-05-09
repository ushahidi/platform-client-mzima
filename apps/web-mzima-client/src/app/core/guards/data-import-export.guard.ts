import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { CONST } from '@constants';
import { Permissions } from '@enums';

@Injectable({
  providedIn: 'root',
})
export class DataImportExportGuard implements CanActivate {
  canActivate(): boolean {
    const permissions = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}permissions`);
    return !!permissions?.includes(Permissions.ImportExport);
  }
}
