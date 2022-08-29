import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../shared';

import { UserSettingsRoutingModule } from './user-settings-routing.module';
import { UserSettingsComponent } from './user-settings.component';

@NgModule({
  declarations: [UserSettingsComponent],
  imports: [
    CommonModule,
    UserSettingsRoutingModule,
    TranslateModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
})
export class UserSettingsModule {}
