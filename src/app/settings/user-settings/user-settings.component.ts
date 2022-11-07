import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CONST } from '@constants';
import { UsersService } from '@services';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss'],
})
export class UserSettingsComponent implements OnInit {
  xhdParams = {
    id: null,
    user_id: localStorage.getItem(`${CONST.LOCAL_STORAGE_PREFIX}userId`),
    config_key: '',
    config_value: '',
  };

  public form: FormGroup = this.formBuilder.group({
    hdx_maintainer_id: ['', [Validators.required]],
    hdx_api_key: ['', [Validators.required]],
  });

  constructor(
    private formBuilder: FormBuilder, //
    private usersService: UsersService,
  ) {}

  ngOnInit() {
    if (this.xhdParams.user_id)
      this.usersService.getUserSettings(this.xhdParams.user_id).subscribe({
        next: (response) => {
          response.results.forEach((setting: any) => {
            this.updateSettings(setting);
          });
        },
      });
  }

  updateSettings(setting: any) {
    if (setting.config_key === 'hdx_api_key') {
      setting.config_value =
        '*** *** *** *** *** *** *** ' +
        setting.config_value.slice(setting.config_value.length - 4);
      this.form.patchValue({ hdx_api_key: setting.config_value });
    }

    if (setting.config_key === 'hdx_maintainer_id') {
      this.form.patchValue({ hdx_maintainer_id: setting.config_value });
    }
  }

  public saveMaintainerId() {
    this.xhdParams.config_key = 'hdx_maintainer_id';
    this.xhdParams.config_value = this.form.controls['hdx_maintainer_id'].value;
    this.updateUserSettings();
  }

  public saveApiKey() {
    this.xhdParams.config_key = 'hdx_api_key';
    this.xhdParams.config_value = this.form.controls['hdx_api_key'].value;
    this.updateUserSettings();
  }

  private updateUserSettings() {
    if (this.xhdParams.user_id)
      this.usersService.updateUserSettings(this.xhdParams.user_id, this.xhdParams).subscribe({
        next: (response) => console.log(response),
      });
  }
}
