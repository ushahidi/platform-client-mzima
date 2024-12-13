import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { SessionService, BreakpointService, NotificationService } from '@services';
import { mergeMap, Observable } from 'rxjs';
import { SettingsMapComponent } from './settings-map/settings-map.component';
import { MediaService, ApiKeyService, ApiKeysResultInterface } from '@mzima-client/sdk';
import { ConfigService } from '../../core/services/config.service';
import { LoaderService } from '../../core/services/loader.service';
import { LanguageService } from '../../core/services/language.service';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EventEmitter, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@UntilDestroy()
@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss'],
})
export class GeneralComponent implements OnInit {
  @Output() cancel = new EventEmitter();
  @ViewChild('mapSettings') mapSettings: SettingsMapComponent;
  public isDesktop$: Observable<boolean>;
  public generalForm: FormGroup;
  public copySuccess = false;
  public submitted = false;
  initialFormValue: any;
  changesMade = false;
  siteConfig: any;
  apiKey: ApiKeysResultInterface;
  uploadedFile?: File;
  minObfuscation = 0;
  maxObfuscation = 9;

  constructor(
    private sessionService: SessionService,
    private formBuilder: FormBuilder,
    private mediaService: MediaService,
    private configService: ConfigService,
    private loader: LoaderService,
    public langService: LanguageService,
    private translate: TranslateService,
    private apiKeyService: ApiKeyService,
    private confirmModalService: ConfirmModalService,
    private clipboard: Clipboard,
    private breakpointService: BreakpointService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
    this.generalForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: ['', []],
      email: ['', [Validators.email, Validators.required]],
      language: ['en', []],
      private: [false, []],
      disable_registration: [false, []],
    });
  }

  ngOnInit(): void {
    this.siteConfig = this.sessionService.getSiteConfigurations();

    this.generalForm.patchValue({
      name: this.siteConfig.name,
      description: this.siteConfig.description,
      email: this.siteConfig.email,
      language: this.siteConfig.language,
      private: this.siteConfig.private,
      disable_registration: this.siteConfig.disable_registration,
    });
    this.apiKeyService.get().subscribe((res) => {
      this.apiKey = res.results.shift()!;
    });
    this.translate.onLangChange.subscribe((newLang) => {
      this.generalForm.controls['language'].setValue(newLang.lang);
    });
    this.generalForm.valueChanges.pipe(untilDestroyed(this)).subscribe(() => {
      this.changesMade = true;
    });
    this.initialFormValue = this.generalForm.value;
  }

  fileUploaded(event: any) {
    this.siteConfig.image_header = event.dataURI;
    this.uploadedFile = event.file;
  }

  headerImageDeleted() {
    this.siteConfig.image_header = '';
    this.uploadedFile = undefined;
  }

  public async generateApiKey(): Promise<void> {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.api_key.change_question'),
      description: `<p>${this.translate.instant('notify.default.proceed_warning')}</p>`,
      confirmButtonText: this.translate.instant('settings.general_settings.generate_api_key'),
    });

    if (!confirmed) return;

    if (this.apiKey) {
      this.apiKeyService.update(this.apiKey.id, this.apiKey).subscribe((newKey: any) => {
        this.apiKey = newKey.result;
      });
    } else {
      this.apiKeyService.post({}).subscribe((newKey: any) => {
        this.apiKey = newKey.result;
      });
    }
  }

  save() {
    this.submitted = true;
    this.loader.show();
    if (this.uploadedFile) {
      this.mediaService
        .uploadFile(this.uploadedFile)
        .pipe(
          mergeMap((newImage: any) => {
            this.siteConfig.image_header = newImage.result.original_file_url;
            return this.updateSettings();
          }),
        )
        .subscribe({
          complete: () => {
            this.loader.hide();
            this.submitted = false;
          },
          error: (error) => {
            this.loader.hide();
            this.submitted = false;
            this.notificationService.showError(error.message);
          },
        });
    } else {
      this.updateSettings().subscribe({
        complete: () => {
          this.submitted = false;
          this.loader.hide();
          this.changesMade = false;
        },
        error: (error) => {
          this.submitted = false;
          this.loader.hide();
          this.notificationService.showError(error.message);
        },
      });
    }
  }

  private updateSettings() {
    const siteConfig = Object.assign({}, this.generalForm.value, {
      image_header: this.siteConfig.image_header,
    });

    this.langService.changeLanguage(siteConfig.language);

    return this.configService.update('site', siteConfig).pipe(
      mergeMap((updatedSite: any) => {
        this.sessionService.setConfigurations('site', updatedSite.result);
        return this.configService.update('map', this.mapSettings.mapConfig);
      }),
    );
  }

  public copyToClipboard(str: string): void {
    this.copySuccess = this.clipboard.copy(str);
    setTimeout(() => (this.copySuccess = !this.copySuccess), 2000);
  }

  isIntegerAndZeroToNine(value: any): boolean {
    value === '0' ? (value = parseFloat(value)) : value;
    return Number.isInteger(value) && value >= this.minObfuscation && value <= this.maxObfuscation;
  }
  public async openConfirmModal() {
    if (this.changesMade) {
      const confirmed = await this.confirmModalService.open({
        title: this.translate.instant('notify.default.data_has_not_been_saved'),
        description: this.translate.instant('notify.default.proceed_warning'),
        confirmButtonText: this.translate.instant('notify.confirm_modal.deleted.success_button'),
      });
      if (confirmed) {
        const currentFormValue = this.generalForm.value;
        if (JSON.stringify(currentFormValue) !== JSON.stringify(this.initialFormValue)) {
          this.generalForm.patchValue(this.initialFormValue);
          this.cancel.emit();
          this.showSnackbar(this.translate.instant('notify.snackbar.changes_discarded'));
          this.changesMade = false;
        }
      } else {
        // nothing will happen, will remain in the current state
      }
    } else {
      this.showSnackbar(this.translate.instant('notify.snackbar.no_changes_made'));
    }
  }
  public showSnackbar(message: string) {
    this.snackBar.open(message, this.translate.instant('notify.snackbar.close'), {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }
}
