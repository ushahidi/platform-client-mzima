import { Component, EventEmitter, Input, OnInit, Output, forwardRef } from '@angular/core';
import { FilterControl, FilterControlOption } from '@models';
import {
  CategoriesService,
  CategoryInterface,
  Savedsearch,
  SavedsearchesService,
} from '@mzima-client/sdk';
import { AlertService, SessionService } from '@services';
import { searchFormHelper } from '@helpers';
import _ from 'lodash';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

enum FilterType {
  SELECT = 'SELECT',
  MULTISELECT = 'MULTISELECT',
  MULTILEVELSELECT = 'MULTILEVELSELECT',
  DATE = 'DATE',
  LOCATION = 'LOCATION',
}

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterComponent),
      multi: true,
    },
  ],
})
export class FilterComponent implements ControlValueAccessor, OnInit {
  @Input() public filter: FilterControl;
  @Input() public totalPosts: number;
  @Output() filterClear = new EventEmitter();
  public type: FilterType;
  public options: FilterControlOption[] = [];
  public isOptionsLoading = true;
  public activeSavedSearch?: Savedsearch;
  public filterType = FilterType;
  public selectedCategory: FilterControlOption | null;
  public isPristine = true;
  public isSubcategoriesPristine = true;

  value: any;
  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(
    private savedsearchesService: SavedsearchesService,
    private session: SessionService,
    private alertService: AlertService,
    private categoriesService: CategoriesService,
  ) {
    const activeSavedSearch = localStorage.getItem(
      this.session.getLocalStorageNameMapper('activeSavedSearch'),
    );
    this.activeSavedSearch = activeSavedSearch ? JSON.parse(activeSavedSearch) : null;
  }

  writeValue(value: any): void {
    this.type === FilterType.MULTISELECT || this.type === FilterType.MULTILEVELSELECT
      ? (this.value = new Set(value))
      : (this.value = value);

    if (this.filter.name === 'tags') {
      this.options.map((option) => {
        option.checked = this.value.has(option.value);
        option.options?.map((o) => (o.checked = this.value.has(o.value)));
      });
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  ngOnInit(): void {
    this.getFilterData();
  }

  private getFilterData(): void {
    switch (this.filter.name) {
      case 'set':
        this.getSavedFilters();
        this.type = FilterType.SELECT;
        break;

      case 'form':
        this.options = this.filter.options ?? [];
        this.type = FilterType.MULTISELECT;
        this.isOptionsLoading = false;
        break;

      case 'source':
        this.getDataSources();
        this.type = FilterType.MULTISELECT;
        break;

      case 'status':
        this.getStatuses();
        this.type = FilterType.MULTISELECT;
        break;

      case 'tags':
        this.getCategories();
        this.type = FilterType.MULTILEVELSELECT;
        break;

      case 'date':
        this.type = FilterType.DATE;
        this.isOptionsLoading = false;
        break;

      case 'center_point':
        this.type = FilterType.LOCATION;
        this.isOptionsLoading = false;
        break;

      default:
        break;
    }
  }

  private getSavedFilters(): void {
    this.isOptionsLoading = true;
    this.savedsearchesService.get().subscribe({
      next: (response) => {
        this.options = response.results.map((filter) => ({
          value: filter.id,
          label: filter.name,
          checked: this.activeSavedSearch && filter.id === this.activeSavedSearch.id,
          info: `Applied filters: ${this.getObjectKeysCount(filter.filter)} of 24`,
        }));
        this.isOptionsLoading = false;
      },
      error: (err) => {
        if (err.message.match(/Http failure response for/)) {
          this.isOptionsLoading = false;
          setTimeout(() => this.getSavedFilters(), 5000);
        }
      },
    });
  }

  private getDataSources(): void {
    this.options = searchFormHelper.sources.map((source) => ({
      value: source.value,
      label: source.name,
      checked: source.checked,
    }));
    this.isOptionsLoading = false;
  }

  private getStatuses(): void {
    this.options = searchFormHelper.statuses.map((status) => ({
      value: status.value,
      label: status.name,
    }));
    this.isOptionsLoading = false;
  }

  private getCategories(): void {
    this.categoriesService.get().subscribe({
      next: (response) => {
        const mainCategories = response?.results.filter((c: CategoryInterface) => !c.parent_id);
        this.options = mainCategories?.map((category: CategoryInterface) => ({
          checked: this.value.has(category.id),
          value: category.id,
          label: String(category.tag),
          color: category.color!,
          options: response?.results
            ?.filter((cat: CategoryInterface) => cat.parent_id === category.id)
            .map((cat: CategoryInterface) => ({
              value: cat.id,
              label: cat.tag,
              checked: this.value.has(cat.id),
            })),
        }));
        this.isOptionsLoading = false;
      },
      error: (err) => {
        if (err.message.match(/Http failure response for/)) {
          setTimeout(() => this.getCategories(), 5000);
        }
      },
    });
  }

  public getObjectKeysCount(obj: any): number {
    return Object.keys(obj).length;
  }

  public radioChangeHandle(event: any): void {
    this.value = event.detail.value;
  }

  public async addClickHandle(): Promise<void> {
    if (this.filter.name === 'set') {
      const result = await this.alertService.presentAlert({
        header: 'Save filter name?',
        inputs: [
          {
            placeholder: 'Filter name',
          },
        ],
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Save',
            role: 'confirm',
            cssClass: 'primary',
          },
        ],
      });

      if (result.role === 'confirm') {
        // TODO: Save new saved filter
        console.log('add new filter with name: ', result.data.values[0]);
      }
    }
  }

  public async deleteOption(): Promise<void> {
    if (this.filter.name === 'set') {
      const result = await this.alertService.presentAlert({
        header: 'Are you sure you want to delete this saved filters?',
        message: 'Deleting means that from now you will not see it in your saved list. ',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Delete',
            role: 'confirm',
            cssClass: 'danger',
          },
        ],
      });

      if (result.role === 'confirm') {
        // TODO: Delete saved filter
        console.log('Delete saved filter');
      }
    }
  }

  public async editOption(): Promise<void> {
    if (this.filter.name === 'set') {
      // TODO: Edit saved filter
      console.log('Edit saved filter');
    }
  }

  public getFirstLetter(label: any): string {
    return typeof label === 'string' && label ? label[0] : '';
  }

  public showSubcategories(category: FilterControlOption): void {
    this.selectedCategory = _.cloneDeep(category);
  }

  public getCheckedSubcategoriesLength(options?: Omit<FilterControlOption, 'options'>[]): number {
    return options?.filter((o) => o.checked).length ?? 0;
  }

  public modalCloseHandle(): void {
    this.selectedCategory = null;
    this.isSubcategoriesPristine = true;
  }

  public applySelectedSubcategories(): void {
    if (!this.selectedCategory) return;
    const option = this.options.find((o) => o.value === this.selectedCategory?.value);
    if (!option) return;
    const changedOptions = option.options
      ?.filter(
        (o) =>
          o.checked !== this.selectedCategory?.options?.find((so) => so.value === o.value)?.checked,
      )
      .map((o) => (!o.checked ? this.value.add(o.value) : this.value.delete(o.value)));
    if (changedOptions?.length) {
      this.isPristine = false;
    }
    option.options = _.cloneDeep(this.selectedCategory.options);
    option.checked = !!option.options?.find((o) => o.checked);
    option.checked ? this.value.add(option.value) : this.value.delete(option.value);
    this.selectedCategory = null;
    this.isSubcategoriesPristine = true;
  }

  public async clearSelectedSubcategories(): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: `Clear ${this.selectedCategory?.label} filter?`,
      message: 'This filter will be cleared',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Clear',
          role: 'confirm',
          cssClass: 'danger',
        },
      ],
    });

    if (result.role === 'confirm') {
      this.selectedCategory?.options?.forEach((option) => (option.checked = false));
    }
  }

  public optionChanged(state: boolean, option: FilterControlOption): void {
    state ? this.value.add(option.value) : this.value.delete(option.value);
    this.isPristine = false;
  }

  public applyFilter(): void {
    this.onChange(
      this.type === FilterType.MULTISELECT || this.type === FilterType.MULTILEVELSELECT
        ? [...this.value]
        : this.value,
    );
  }

  public async clearFilter(): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: `Clear ${this.filter.label} filter?`,
      message: 'This filter will be cleared',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Clear',
          role: 'confirm',
          cssClass: 'danger',
        },
      ],
    });

    if (result.role === 'confirm') {
      this.filterClear.emit();
    }
  }
}
