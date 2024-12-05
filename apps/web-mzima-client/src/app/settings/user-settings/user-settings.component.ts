import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { BreakpointService, NotificationService } from '@services';
import { generalHelpers, UsersService } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';

@UntilDestroy()
@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
  private userId: string;
  public isDesktop$: Observable<boolean>;
  public form: FormGroup;
  public submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private usersService: UsersService,
    private breakpointService: BreakpointService,
    private notificationService: NotificationService,
    private translate: TranslateService,
    private router: Router,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
    this.userId = localStorage.getItem(`${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}userId`)!;
    this.form = this.formBuilder.group({
      hdx_maintainer_id: ['', [Validators.required, Validators.minLength(3)]],
      maintainer_id: [''],
      hdx_api_key: ['', [Validators.required, Validators.minLength(3)]],
      api_id: [''],
    });
  }

  ngOnInit() {
    this.getSettingsHDX();
  }

  private getSettingsHDX() {
    this.usersService.getUserSettings(this.userId!).subscribe({
      next: (response) => {
        response.results?.forEach((setting: any) => {
          this.updateSettings(setting);
        });
      },
    });
  }

  private updateSettings(setting: any) {
    if (setting.config_key === 'hdx_api_key') {
      setting.config_value =
        '*** *** *** *** *** *** *** ' +
        setting.config_value.slice(setting.config_value.length - 4);
      this.form.patchValue({
        hdx_api_key: setting.config_value,
        api_id: setting.id,
      });
    }

    if (setting.config_key === 'hdx_maintainer_id') {
      this.form.patchValue({
        hdx_maintainer_id: setting.config_value,
        maintainer_id: setting.id,
      });
    }
  }

  public saveInformation() {
    this.submitted = true;
    const params = {
      user_id: this.userId!,
    };
    const queries = [];
    queries.push(this.saveMaintainer(params));
    if (!this.form.controls['hdx_api_key'].value.includes('*')) {
      queries.push(this.saveHdxApi(params));
    }
    forkJoin(queries).subscribe({
      next: () => {
        this.submitted = false;
        this.getSettingsHDX();
        this.showNotification('success');
      },
      error: (err) => {
        console.log(err);
        this.submitted = false;
        this.showNotification('error');
      },
    });
  }

  private saveMaintainer(params: any) {
    const config = {
      ...params,
      id: this.form.controls['maintainer_id'].value || null,
      config_key: 'hdx_maintainer_id',
      config_value: this.form.controls['hdx_maintainer_id'].value,
    };
    if (this.form.controls['maintainer_id'].value) {
      return this.usersService.updateUserSettings(
        this.userId!,
        config,
        this.form.controls['maintainer_id'].value,
      );
    } else {
      return this.usersService.postUserSettings(this.userId!, config);
    }
  }

  private saveHdxApi(params: any) {
    const config = {
      ...params,
      id: this.form.controls['api_id'].value || null,
      config_key: 'hdx_api_key',
      config_value: this.form.controls['hdx_api_key'].value,
    };

    if (this.form.controls['api_id'].value) {
      return this.usersService.updateUserSettings(
        this.userId!,
        config,
        this.form.controls['api_id'].value,
      );
    } else {
      return this.usersService.postUserSettings(this.userId!, config);
    }
  }

  private showNotification(type: 'success' | 'error') {
    switch (type) {
      case 'success':
        const config = {
          icon: {
            color: 'success',
            name: 'thumb-up',
          },
          title: 'settings.user_settings.api_key_saved',
          buttons: [
            // {
            //   color: 'gray',
            //   text: 'settings.user_settings.start_tagging',
            //   handler: () => {
            //     this.router.navigate(['/settings/hdx']);
            //   },
            // },
            {
              color: 'primary',
              text: 'notify.export.confirmation',
            },
          ],
        };
        this.displaySnackBar(config);
        break;
      default:
        this.notificationService.showError(this.translate.instant('data_export.data_export_err'));
        break;
    }
  }

  private displaySnackBar(config: any) {
    this.notificationService.showSnackbar(config, {
      duration: 0,
      wide: true,
    });
  }
}
