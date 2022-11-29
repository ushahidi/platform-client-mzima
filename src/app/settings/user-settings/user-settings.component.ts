import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CONST } from '@constants';
import { UsersService } from '@services';
import dayjs from 'dayjs';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
  private userId = localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}userId`);

  public form: FormGroup = this.formBuilder.group({
    user: ['', [Validators.required]],
    hdx_maintainer_id: ['', [Validators.required]],
    maintainer_privileges: ['', [Validators.required]],
    maintainer_id: ['', [Validators.required]],
    maintainer_created: ['', [Validators.required]],
    maintainer_url: ['', [Validators.required]],
    hdx_api_key: ['', [Validators.required]],
    api_privileges: ['', [Validators.required]],
    api_id: ['', [Validators.required]],
    api_created: ['', [Validators.required]],
    api_url: ['', [Validators.required]],
  });

  constructor(
    private formBuilder: FormBuilder, //
    private usersService: UsersService,
  ) {}

  ngOnInit() {
    this.getSettingsHDX();
  }

  private getSettingsHDX() {
    this.usersService.getUserSettings(this.userId!).subscribe({
      next: (response) => {
        response.results.forEach((setting: any) => {
          this.updateSettings(setting);
        });
      },
    });
  }

  private updateSettings(setting: any) {
    this.form.patchValue({ user: setting.user });
    if (setting.config_key === 'hdx_api_key') {
      setting.config_value =
        '*** *** *** *** *** *** *** ' +
        setting.config_value.slice(setting.config_value.length - 4);
      this.form.patchValue({
        hdx_api_key: setting.config_value,
        api_privileges: setting.allowed_privileges,
        api_id: setting.id,
        api_created: setting.created,
        api_url: setting.url,
      });
    }

    if (setting.config_key === 'hdx_maintainer_id') {
      this.form.patchValue({
        hdx_maintainer_id: setting.config_value,
        maintainer_id: setting.id,
        maintainer_privileges: setting.allowed_privileges,
        maintainer_created: setting.created,
        maintainer_url: setting.url,
      });
    }
  }

  public saveInformation() {
    const params = {
      user: this.form.controls['user'].value,
    };
    const queries = [];
    queries.push(this.saveMaintainer(params));
    if (!this.form.controls['hdx_api_key'].value.includes('*')) {
      queries.push(this.saveHdxApi(params));
    }
    forkJoin(queries).subscribe({
      next: () => this.getSettingsHDX(),
    });
  }

  private saveMaintainer(params: any) {
    return this.usersService.updateUserSettings(
      this.userId!,
      {
        ...params,
        allowed_privileges: this.form.controls['maintainer_privileges'].value,
        created: this.form.controls['maintainer_created'].value,
        updated: dayjs().format(),
        url: this.form.controls['maintainer_url'].value,
        id: this.form.controls['maintainer_id'].value,
        config_key: 'hdx_maintainer_id',
        config_value: this.form.controls['hdx_maintainer_id'].value,
      },
      this.form.controls['maintainer_id'].value,
    );
  }

  private saveHdxApi(params: any) {
    return this.usersService.updateUserSettings(
      this.userId!,
      {
        ...params,
        allowed_privileges: this.form.controls['api_privileges'].value,
        created: this.form.controls['api_created'].value,
        updated: dayjs().format(),
        url: this.form.controls['api_url'].value,
        id: this.form.controls['api_id'].value,
        config_key: 'hdx_api_key',
        config_value: this.form.controls['hdx_api_key'].value,
      },
      this.form.controls['api_id'].value,
    );
  }
}
