import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule, LottieAnimationModule } from '@shared';
import { DataImportRoutingModule } from './data-import-routing.module';
import { DataImportComponent } from './data-import.component';
import { ImportResultsComponent } from './import-results/import-results.component';
import { MzimaUiModule } from '@mzima-client/mzima-ui';

@NgModule({
  declarations: [DataImportComponent, ImportResultsComponent],
  imports: [
    CommonModule,
    DataImportRoutingModule,
    MatProgressBarModule,
    TranslateModule,
    MatButtonModule,
    DirectiveModule,
    MatSelectModule,
    MatIconModule,
    MatRadioModule,
    FormsModule,
    MatTableModule,
    LottieAnimationModule,
    MzimaUiModule,
  ],
})
export class DataImportModule {}
