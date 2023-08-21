import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { BreakpointService } from '@services';
import { generalHelpers, UsersService } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

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
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
    this.userId = localStorage.getItem(`${generalHelpers.CONST.LOCAL_STORAGE_PREFIX}userId`)!;
    this.form = this.formBuilder.group({
      hdx_maintainer_id: ['', [Validators.required]],
      maintainer_id: [''],
      hdx_api_key: ['', [Validators.required]],
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
      },
      error: (err) => {
        console.log(err);
        this.submitted = false;
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
}
