import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent {
  searchQuery: string = '';
  @Input() isFiltersVisible: boolean;
  @Input() isMainFiltersOpen: boolean;
  @Input() form: FormGroup;
  @Output() public applyFilters = new EventEmitter();
  @Output() public searchPosts = new EventEmitter();

  public onSearchChange() {
    this.searchPosts.emit(this.searchQuery);
  }

  public clearSearchResult() {
    this.searchQuery = '';
    this.searchPosts.emit(this.searchQuery);
  }
}
