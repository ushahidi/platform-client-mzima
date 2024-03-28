import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Savedsearch, SurveyItem } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { FilterType } from '../filter-control/filter-control.component';
import { searchFormHelper } from '@helpers';
import { MultilevelSelectOption } from '../multilevel-select/multilevel-select.component';
import { Observable } from 'rxjs';
import { BreakpointService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-main-filters',
  templateUrl: './main-filters.component.html',
  styleUrls: ['./main-filters.component.scss'],
})
export class MainFiltersComponent {
  @Input() form: FormGroup;
  @Input() isFiltersVisible: boolean;
  @Input() canCreateSearch: boolean;
  @Input() isMainFiltersOpen: boolean;
  @Input() isEditAvailable: boolean;
  @Input() surveyList: SurveyItem[];
  @Input() savedSearches: Savedsearch[];
  @Input() sources: typeof searchFormHelper.sources;
  @Input() statuses: typeof searchFormHelper.statuses;
  @Input() categoriesData: MultilevelSelectOption[];
  @Input() activeSavedSearchValue: number | null;

  @Output() public applyFilters = new EventEmitter();
  @Output() public clearFilter = new EventEmitter();
  @Output() public saveSearch = new EventEmitter();
  @Output() public toggleFilters = new EventEmitter();
  @Output() public resetSavedFilter = new EventEmitter();
  @Output() public applyAndClose = new EventEmitter();
  @Output() public applySavedFilter = new EventEmitter();
  @Output() public toggleSidebarFilters = new EventEmitter();

  public filterType = FilterType;
  public isDesktop$: Observable<boolean>;

  constructor(private breakpointService: BreakpointService) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
  }

  public showAllButton(filterName: string) {
    return (
      JSON.stringify(this.form.controls[filterName].getRawValue()) === JSON.stringify(['none'])
    );
  }
}
