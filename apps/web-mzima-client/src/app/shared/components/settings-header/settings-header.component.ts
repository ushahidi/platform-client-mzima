import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreakpointService } from '@services';
import { Observable } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-settings-header',
  templateUrl: './settings-header.component.html',
  styleUrls: ['./settings-header.component.scss'],
})
export class SettingsHeaderComponent {
  @Input() settingsTitle: string;
  @Input() newButtonTitle: string;
  @Input() selectedItem: any;
  @Input() isShowActionsButton = true;
  @Input() isShowCreation = true;
  @Input() isSelectTranslate = false;
  @Input() isShowTranslation = false;
  @Input() selectedLanguage: any;
  @Input() defaultLanguage: any;
  @Input() languages: any[];
  @Output() isShowActionsChange = new EventEmitter();
  @Output() deleteCall = new EventEmitter();
  @Output() showLanguagesCall = new EventEmitter();
  @Output() selectLanguageCall = new EventEmitter();
  public isDesktop$: Observable<boolean>;
  public isShowActions = false;

  constructor(private breakpointService: BreakpointService) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
  }

  public deleteEmit() {
    this.deleteCall.emit(true);
  }

  public showActions() {
    this.isShowActionsChange.emit((this.isShowActions = !this.isShowActions));
  }

  public selectLanguageEmit(event: MatSelectChange) {
    this.selectLanguageCall.emit(event.value);
  }

  public showLanguagesEmit() {
    this.showLanguagesCall.emit(true);
  }
}
