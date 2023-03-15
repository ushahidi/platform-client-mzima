import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { TranslateModule } from '@ngx-translate/core';
import { DirectiveModule, SpinnerModule } from '@shared';
import { DataSourceItemComponent } from './data-source-item/data-source-item.component';
import { DataSourcesRoutingModule } from './data-sources-routing.module';
import { DataSourcesComponent } from './data-sources.component';

@NgModule({
  declarations: [DataSourcesComponent, DataSourceItemComponent],
  imports: [
    CommonModule,
    DataSourcesRoutingModule,
    MatButtonModule,
    DirectiveModule,
    MatIconModule,
    SpinnerModule,
    TranslateModule,
    MatSelectModule,
    FormsModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatTableModule,
    MatInputModule,
    MatRadioModule,
    MatRippleModule,
  ],
})
export class DataSourcesModule {}
