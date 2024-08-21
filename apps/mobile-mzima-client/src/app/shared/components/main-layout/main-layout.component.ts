import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { SearchFormComponent } from '../search-form/search-form.component';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent {
  @ViewChild('searchForm') public searchForm: SearchFormComponent;
  @Input() public title?: string;
  @Input() public header = true;
  @Input() public isSearch = false;
  @Input() public placeholderText: string;
  @Output() back = new EventEmitter();
  @Output() search = new EventEmitter<string>();
  @Output() searchFocus = new EventEmitter();
  @Output() searchBlur = new EventEmitter();
  public searchFormValue = '';
  public isSearchView = false;

  public searchQueryChanged(): void {
    this.search.emit(this.searchFormValue);
  }

  public searchFocusHandle(): void {
    this.isSearchView = true;
    this.searchFocus.emit();
  }

  public searchBlurHandle(): void {
    this.isSearchView = false;
    this.searchBlur.emit();
    this.search.emit('');
  }

  public closeSearchForm(): void {
    this.searchForm.hideSearchResults();
  }
}
