import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { searchFormHelper } from '@helpers';
import { CollectionResult, Savedsearch, SurveyItem } from '@mzima-client/sdk';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-survey-filters',
  templateUrl: './survey-filters.component.html',
  styleUrls: ['./survey-filters.component.scss'],
})
export class SurveyFiltersComponent {
  @Input() form: FormGroup;
  @Input() total: number | undefined;
  @Input() notMappedPostsCount: number;
  @Input() collectionInfo?: CollectionResult;
  @Input() surveyList: SurveyItem[];
  @Input() sources: typeof searchFormHelper.sources;
  @Input() isMapView: boolean;
  @Input() isLoggedIn: boolean;
  @Input() isFiltersVisible: boolean;
  @Input() isMainFiltersOpen: boolean;
  @Input() isOnboardingActive: boolean;
  @Input() surveysLoaded: boolean;
  @Input() isNotificationsOn: boolean;
  @Input() isNotificationLoading: boolean;
  @Input() activeSavedSearch?: Savedsearch;

  @Output() public applyFilters = new EventEmitter();
  @Output() public toggleMainFilters = new EventEmitter();
  @Output() public toggleSidebarFilters = new EventEmitter();
  @Output() public clearSavedFilter = new EventEmitter();
  @Output() public clearFilter = new EventEmitter();
  @Output() public clearCollection = new EventEmitter();
  @Output() public changeNorificationStatus = new EventEmitter();

  public showAllButton(filterName: string) {
    return (
      JSON.stringify(this.form.controls[filterName].getRawValue()) === JSON.stringify(['none'])
    );
  }
}
