import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService } from '@services';
import { Observable } from 'rxjs';

export interface IDeactivateGuard {
  changesMade: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class DeactivateGuardService implements CanDeactivate<IDeactivateGuard> {
  constructor(
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
  ) {}

  canDeactivate(component: IDeactivateGuard): boolean | Promise<boolean> | Observable<boolean> {
    if (component.changesMade) {
      const confirmModalResult = this.openConfirmModal().then((confirmed: boolean) => confirmed);
      return confirmModalResult;
    } else {
      return true;
    }
  }

  async openConfirmModal() {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.default.discard_changes'),
      description: this.translate.instant('notify.default.survey_has_not_been_saved'),
      confirmButtonText: this.translate.instant('notify.survey.discard_changes'),
      cancelButtonText: this.translate.instant('notify.survey.back_to_editing'),
      isConfirmNotDestructive: false,
      isCancelDestructive: false,
    });
    return confirmed;
  }
}
