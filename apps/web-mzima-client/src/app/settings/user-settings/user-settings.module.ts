import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule } from '@shared';

import { UserSettingsRoutingModule } from './user-settings-routing.module';
import { UserSettingsComponent } from './user-settings.component';
import { MzimaUiModule } from '@mzima-client/mzima-ui';

@NgModule({
  declarations: [UserSettingsComponent],
  imports: [
    CommonModule,
    UserSettingsRoutingModule,
    TranslateModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    DirectiveModule,
    MatIconModule,
    MzimaUiModule,
  ],
})
export class UserSettingsModule {}
