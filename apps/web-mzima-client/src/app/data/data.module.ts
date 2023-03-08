import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { SpinnerModule } from '../shared/components/spinner/spinner.module';
import { DataComponent } from './data.component';

@NgModule({
  declarations: [DataComponent],
  imports: [CommonModule, MatTableModule, MatPaginatorModule, SpinnerModule],
})
export class DataModule {}
