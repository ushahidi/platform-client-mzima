import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule } from '@shared';
import { SettingsModule } from '../settings.module';
import { GeneralRoutingModule } from './general-routing.module';
import { GeneralComponent } from './general.component';
import { SettingsMapComponent } from './settings-map/settings-map.component';

@NgModule({
  declarations: [GeneralComponent, SettingsMapComponent],
  imports: [
    CommonModule,
    GeneralRoutingModule,
    LeafletModule,
    SettingsModule,
    TranslateModule,
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    DirectiveModule,
    FormsModule,
  ],
})
export class GeneralModule {}
