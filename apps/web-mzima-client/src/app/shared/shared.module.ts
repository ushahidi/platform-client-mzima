import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CollectionsComponent } from '@data';
import { TranslateModule } from '@ngx-translate/core';
import { SafePipe } from '@pipes';
import { ColorPickerModule } from 'ngx-color-picker';
import { ShareModule } from 'ngx-sharebuttons';
import { NgxCustomTourModule } from 'ngx-custom-tour';
import { DonationModalComponent } from '../settings';

import {
  AccountSettingsModalComponent,
  CollectionsModalComponent,
  CompanyInfoComponent,
  ConfirmModalComponent,
  CookiesNotificationComponent,
  DonationButtonComponent,
  LanguageComponent,
  PageNotFoundComponent,
  SaveSearchModalComponent,
  SearchFormComponent,
  SelectLanguagesModalComponent,
  ShareModalComponent,
  SidebarComponent,
  SnackbarComponent,
  SubmitPostButtonComponent,
  SupportModalComponent,
  OnboardingComponent,
  ToolbarComponent,
  NotificationComponent,
} from './components';
import { CollectionItemModule } from './components/collection-item/collection-item.module';
import { FilterControlModule } from './components/filter-control/filter-control.module';
import { GroupCheckboxSelectModule } from './components/group-checkbox-select/group-checkbox-select.module';
import { LottieAnimationModule } from './components/lottie-animation/lottie-animation.module';
import { SpinnerModule } from './components/spinner/spinner.module';
import { DeploymentDetailsComponent } from './components/deployment-details/deployment-details.component';
import { DirectiveModule } from './directive.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AddPostModalComponent } from '@post';
import { MzimaUiModule } from '@mzima-client/mzima-ui';

const components = [
  SidebarComponent,
  ToolbarComponent,
  SubmitPostButtonComponent,
  LanguageComponent,
  SearchFormComponent,
  CompanyInfoComponent,
  DonationButtonComponent,
  CookiesNotificationComponent,
  AccountSettingsModalComponent,
  CollectionsModalComponent,
  ConfirmModalComponent,
  SaveSearchModalComponent,
  SelectLanguagesModalComponent,
  ShareModalComponent,
  SnackbarComponent,
  SupportModalComponent,
  OnboardingComponent,
  CollectionsComponent,
  PageNotFoundComponent,
  AddPostModalComponent,
  DonationModalComponent,
  NotificationComponent,
  SafePipe,
  DeploymentDetailsComponent,
];

const modules = [
  CommonModule,
  RouterModule,
  ReactiveFormsModule,
  FormsModule,
  TranslateModule,
  ColorPickerModule,
  FilterControlModule,
  SpinnerModule,
  DirectiveModule,
  LottieAnimationModule,
  GroupCheckboxSelectModule,
  ShareModule,
  NgxCustomTourModule,
  CollectionItemModule,
  MzimaUiModule,
];

const material = [
  MatButtonModule,
  MatIconModule,
  MatToolbarModule,
  MatMenuModule,
  MatExpansionModule,
  MatSelectModule,
  MatInputModule,
  MatListModule,
  MatTabsModule,
  MatDialogModule,
  MatRadioModule,
  MatCheckboxModule,
  MatProgressBarModule,
  MatRippleModule,
  MatTooltipModule,
  MatSlideToggleModule,
  MatSnackBarModule,
];

@NgModule({
  declarations: [...components],
  imports: [...modules, ...material],
  exports: [...components, ...modules, ...material],
})
export class SharedModule {}
