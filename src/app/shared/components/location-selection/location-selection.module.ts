import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { LocationSelectionComponent } from './location-selection.component';

@NgModule({
  declarations: [LocationSelectionComponent],
  imports: [
    CommonModule,
    TranslateModule,
    MatInputModule,
    FormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
  ],
  exports: [LocationSelectionComponent],
})
export class LocationSelectionModule {}
