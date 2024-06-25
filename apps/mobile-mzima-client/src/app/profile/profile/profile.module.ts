import { NgModule } from '@angular/core';
import { ProfilePage } from './profile.page';
import { ProfilePageRoutingModule } from './profile-routing.module';
import { SharedModule } from '@shared';
import { ProfileMenuItemComponent } from './components';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

const components = [ProfileMenuItemComponent];

@NgModule({
  imports: [ProfilePageRoutingModule, SharedModule, FormsModule, TranslateModule],
  declarations: [ProfilePage, ...components],
})
export class ProfilePageModule {}
