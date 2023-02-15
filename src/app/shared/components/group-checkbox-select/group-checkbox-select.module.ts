import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import { GroupCheckboxSelectComponent } from './group-checkbox-select.component';

@NgModule({
  declarations: [GroupCheckboxSelectComponent],
  imports: [CommonModule, MatRadioModule, MatListModule, FormsModule, MatIconModule],
  exports: [GroupCheckboxSelectComponent],
})
export class GroupCheckboxSelectModule {}
