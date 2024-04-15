import { Component, EventEmitter, Input, Output, ViewChild, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Platform } from '@ionic/angular';
import { FormControlComponent } from '../form-control/form-control.component';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchFormComponent),
      multi: true,
    },
  ],
})
export class SearchFormComponent implements ControlValueAccessor {
  @Output() public search = new EventEmitter<string>();
  @Output() public formFocus = new EventEmitter();
  @Output() public formBlur = new EventEmitter();
  @Output() public back = new EventEmitter();

  @Input() public value?: string;
  @Input() public placeholder: string;
  @ViewChild('searchControl') public searchControl: FormControlComponent;

  public isSearchView = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(protected platform: Platform) {
    if (this.platform.is('android')) {
      this.platform.backButton.subscribeWithPriority(75, (processNextHandler) => {
        console.log('back button via hardware click from search view');
        this.clearSearchAndGoBack();
        processNextHandler();
      });
    }
  }
  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  public resetSearchForm(): void {
    this.value = '';
  }

  public showSearchResults(): void {
    this.isSearchView = true;
    this.formFocus.emit();
  }

  public hideSearchResults(): void {
    this.isSearchView = false;
    this.formBlur.emit();
    this.searchControl.blurInput();
  }

  public searchQueryChanged(): void {
    this.isSearchView = true;
    this.formFocus.emit();
    this.onChange(this.value);
  }

  public clearSearchAndGoBack(): void {
    this.hideSearchResults();
    this.back.emit();
  }
}
