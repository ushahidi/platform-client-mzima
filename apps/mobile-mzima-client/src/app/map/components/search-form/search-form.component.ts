import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormControlComponent } from '@components';
import { PostResult, PostsService, SurveyItem, SurveysService } from '@mzima-client/sdk';
import { Subject, debounceTime, lastValueFrom } from 'rxjs';
import { AlertService, SessionService } from '@services';
import { FilterControl } from '@models';
import { searchFormHelper } from '@helpers';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import _ from 'lodash';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent {
  @Input() public isLight = true;
  public isResultsVisible = false;
  @Input() public totalPosts: number;
  @ViewChild('formControl') formControl: FormControlComponent;
  private readonly searchSubject = new Subject<string>();
  public posts: PostResult[] = [];
  public isPostsLoading = false;
  public isFiltersModalOpen = false;
  public filters: FilterControl[] = [
    {
      name: 'set',
      icon: 'saved-filters',
      label: 'Saved filters',
      selected: 'none',
      selectedLabel: 'Selected:',
      // selectedCount: 3,
      value: this.getFilterDefaultValue('set'),
    },
    {
      name: 'form',
      icon: 'surveys',
      label: 'Surveys',
      selected: 'none',
      selectedCount: 16,
      value: this.getFilterDefaultValue('form'),
    },
    {
      name: 'source',
      icon: 'sources',
      label: 'Sources',
      selectedCount: searchFormHelper.sources.length,
      selected: String(searchFormHelper.sources.length),
      value: this.getFilterDefaultValue('source'),
    },
    {
      name: 'status',
      icon: 'status',
      label: 'Status',
      selectedCount: searchFormHelper.statuses.length,
      selected: '2',
      value: this.getFilterDefaultValue('status'),
    },
    {
      name: 'tags',
      icon: 'categories',
      label: 'Categories',
      selected: 'none',
      // selectedCount: 20,
      value: this.getFilterDefaultValue('tags'),
    },
    {
      name: 'date',
      icon: 'calendar',
      label: 'Date range',
      selectedLabel: 'Select the date range',
      selectedCount: 'All Time',
      value: this.getFilterDefaultValue('date'),
    },
    {
      name: 'center_point',
      icon: 'marker',
      label: 'Location',
      selectedLabel: 'Select locations',
      selectedCount: 'All locations',
      value: this.getFilterDefaultValue('location'),
    },
  ];
  public activeFilters: any;
  public selectedFilter: FilterControl | null;
  private searchParams = {
    limit: 10,
    page: 1,
  };
  public foundPosts: number = 0;

  public form = this.formBuilder.group({
    postsQuery: [''],
  });

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private postsService: PostsService,
    private session: SessionService,
    private surveysService: SurveysService,
  ) {
    const storageFilters = localStorage.getItem(this.session.getLocalStorageNameMapper('filters'))!;

    this.getSurveys();

    this.searchSubject.pipe(debounceTime(500)).subscribe({
      next: (query: string) => {
        this.searchParams.page = 1;
        this.searchPosts(query);
      },
    });

    this.form.valueChanges.subscribe({
      next: (values) => {
        if (values.postsQuery) {
          this.isPostsLoading = true;
          this.searchSubject.next(values.postsQuery);
        }
      },
    });

    if (storageFilters) {
      this.activeFilters = JSON.parse(storageFilters!);
      this.filters.map((f) => {
        f.value = this.activeFilters[f.name];
        this.updateFilterSelectedText(f);
      });
      this.applyFilters();
    }
  }

  private getSurveys(): void {
    this.surveysService.get().subscribe({
      next: (response) => {
        const allSurveysChecked = JSON.parse(
          localStorage.getItem(this.session.getLocalStorageNameMapper('allSurveysChecked')) ||
            'false',
        );
        const formIds = new Set(this.activeFilters?.form ?? []);

        const filterForm = this.filters.find((f) => f.name === 'form');
        filterForm!.options = response.results.map((survey: SurveyItem) => ({
          value: survey.id,
          label: survey.name,
          checked: allSurveysChecked || formIds.has(survey.id),
          info: survey.description,
        }));

        if (!this.activeFilters) {
          filterForm!.value = response.results.map((survey: SurveyItem) => survey.id);
          this.activeFilters = searchFormHelper.DEFAULT_FILTERS;
          this.activeFilters['form'] = response.results.map((s: SurveyItem) => s.id);
          this.applyFilters();
        } else {
          filterForm!.value = response.results
            .filter((survey: SurveyItem) => formIds.has(survey.id) || allSurveysChecked)
            .map((survey: SurveyItem) => survey.id);
        }

        filterForm!.selected = String(filterForm?.value.length ?? 'none');
      },
    });
  }

  private getFilterDefaultValue(filterName: string): any {
    if (filterName === 'source') {
      return searchFormHelper.sources.map((s) => s.value);
    }
    return searchFormHelper.DEFAULT_FILTERS[filterName] ?? null;
  }

  public showSearchResults(): void {
    setTimeout(() => {
      this.isResultsVisible = true;
    }, 50);
  }

  public hideSearchResults(): void {
    this.isResultsVisible = false;
    this.formControl.blurInput();
  }

  public showFiltersModal(ev: Event): void {
    ev.preventDefault();
    ev.stopPropagation();
    this.isFiltersModalOpen = true;
    setTimeout(() => {
      this.hideSearchResults();
    }, 50);
  }

  public async handleClearFilters(): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: 'Clear all filters?',
      message:
        'All filters except <strong>Surveys</strong>, <strong>Sources</strong> and <strong>Status</strong> will be cleared',
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
      this.filters.map((f) => {
        if (f.name === 'form') {
          f.value = f.options?.map((o) => o.value);
        } else {
          f.value = this.getFilterDefaultValue(f.name);
        }
        this.activeFilters[f.name] = f.value;
        this.updateFilterSelectedText(f);
      });
      this.applyFilters();
    }
  }

  public openFilter(filter: FilterControl): void {
    this.selectedFilter = _.cloneDeep(filter);
  }

  public modalCloseHandle(): void {
    if (!this.selectedFilter) {
      this.isFiltersModalOpen = false;
    }
    this.selectedFilter = null;
  }

  private async searchPosts(query: string, add?: boolean): Promise<void> {
    try {
      const response = await lastValueFrom(
        this.postsService.searchPosts('', query, this.searchParams),
      );
      this.posts = add ? [...this.posts, ...response.results] : response.results;
      this.isPostsLoading = false;
      this.foundPosts = response.meta.total;
    } catch (error) {
      console.error('error: ', error);
      this.isPostsLoading = false;
    }
  }

  public async loadMoreSearchResults(ev: any): Promise<void> {
    if (this.form.value.postsQuery) {
      this.searchParams.page++;
      await this.searchPosts(this.form.value.postsQuery, true);
      (ev as InfiniteScrollCustomEvent).target.complete();
    }
  }

  public resetSearchForm(): void {
    this.posts = [];
    this.searchParams.page = 1;
  }

  public applyFilter(value: any, filterName: string, removeSelectedFilter = true): void {
    const originalFilter = this.filters.find((f) => f.name === filterName);
    if (originalFilter) {
      originalFilter.value = value;
      this.activeFilters[originalFilter.name] = originalFilter.value;
      this.updateFilterSelectedText(originalFilter);
      if (originalFilter.name === 'source' || originalFilter.name === 'form') {
        if (originalFilter.value.length > 1 && originalFilter.value.indexOf('none') > -1) {
          originalFilter.value.splice(originalFilter.value.indexOf('none'), 1);
        } else if (originalFilter.value.length === 0) {
          originalFilter.value.push('none');
        }
      }
      this.applyFilters();
    }
    if (removeSelectedFilter) {
      this.selectedFilter = null;
    }
  }

  private updateFilterSelectedText(filter: FilterControl): void {
    filter.selected = filter.value?.length ? String(filter.value.length) : 'none';
  }

  public clearFilter(filterName: string): void {
    if (this.selectedFilter) {
      this.applyFilter(this.getFilterDefaultValue(filterName), this.selectedFilter.name, false);
      this.selectedFilter = _.cloneDeep(this.filters.find((filter) => filter.name === filterName))!;
    }
  }

  private applyFilters(): void {
    localStorage.setItem(
      this.session.getLocalStorageNameMapper('filters'),
      JSON.stringify(this.activeFilters),
    );
    this.postsService.applyFilters(this.activeFilters);
  }
}
