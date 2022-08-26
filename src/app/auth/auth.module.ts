import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent, RegisterComponent } from '@auth';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../shared';

@NgModule({
  declarations: [LoginComponent, RegisterComponent],
  imports: [CommonModule, SharedModule, TranslateModule],
})
export class AuthModule {}
