import { NgModule } from '@angular/core';
import { InformationPage } from './information.page';
import { InformationPageRoutingModule } from './information-routing.module';
import { SharedModule } from '@shared';
import { ProfilePhotoComponent } from './components';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

const components = [ProfilePhotoComponent];

@NgModule({
  imports: [InformationPageRoutingModule, SharedModule, ReactiveFormsModule, TranslateModule],
  declarations: [InformationPage, ...components],
})
export class InformationPageModule {}
