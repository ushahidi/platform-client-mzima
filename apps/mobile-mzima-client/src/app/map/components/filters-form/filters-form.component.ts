import { Component, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormControlComponent, ModalComponent } from '@components';
import {
  PostResult,
  PostsService,
  Savedsearch,
  SavedsearchesService,
  SurveyItem,
  SurveysService,
} from '@mzima-client/sdk';
import { Subject, debounceTime, lastValueFrom, takeUntil } from 'rxjs';
import { AlertService, EnvService, SearchService, SessionService } from '@services';
import { FilterControl, FilterControlOption } from '@models';
import { searchFormHelper, UTCHelper } from '@helpers';
import { InfiniteScrollCustomEvent } from '@ionic/angular';
import _ from 'lodash';
import { Router } from '@angular/router';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-filters-form',
  templateUrl: './filters-form.component.html',
  styleUrls: ['./filters-form.component.scss'],
})
export class FiltersFormComponent implements OnChanges, OnDestroy {
  @Input() public isLight = true;
  @Input() public activatedSavedFilterId?: string;
  @ViewChild('formControl') formControl: FormControlComponent;
  @ViewChild('filtersModal') filtersModal: ModalComponent;
  public totalPosts: number;
  public isResultsVisible = false;
  private readonly searchSubject = new Subject<string>();
  public posts: PostResult[] = [];
  public isPostsLoading = false;
  public isTotalLoading = false;
  public isFiltersModalOpen = false;
  public isAddSavedFiltersMode = false;
  public selectedSavedFilter: FilterControlOption | null;
  public filters: FilterControl[] = [
    {
      name: 'saved-filters',
      icon: 'saved-filters',
      label: 'Saved filters',
      selected: 'none',
      selectedLabel: 'Selected:',
      value: this.getFilterDefaultValue('saved-filters'),
      noOptionsText: "You don't have any saved filters yet",
    },
    {
      name: 'form',
      icon: 'surveys',
      label: 'Surveys',
      selected: 'none',
      selectedCount: '',
      value: [],
      noOptionsText: "You don't have surveys yet",
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
      value: this.getFilterDefaultValue('tags'),
      noOptionsText: "You don't have categories yet",
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
  public activeFilters: any | null = null;
  public selectedFilter: FilterControl | null;
  private searchParams = {
    limit: 10,
    page: 1,
  };
  public foundPosts: number = 0;

  public form = this.formBuilder.group({
    postsQuery: [''],
  });
  private activeSavedFilter?: Savedsearch;
  private surveys: any[] | null = null;
  private destroy$: Subject<void> = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private postsService: PostsService,
    private session: SessionService,
    private surveysService: SurveysService,
    private savedsearchesService: SavedsearchesService,
    private router: Router,
    private searchService: SearchService,
    private envService: EnvService,
  ) {
    this.searchSubject.pipe(takeUntil(this.destroy$), debounceTime(500)).subscribe({
      next: (query: string) => {
        this.searchParams.page = 1;
        this.searchPosts(query);
      },
    });

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe({
      next: (values) => {
        if (values.postsQuery) {
          this.isPostsLoading = true;
          this.searchSubject.next(values.postsQuery);
        }
      },
    });

    this.envService.deployment$.pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.getSurveys();
        this.resetSearchForm();
        this.initFilters();
      },
    });

    this.postsService.totalPosts$.pipe(takeUntil(this.destroy$)).subscribe({
      next: (totalPosts) => {
        this.totalPosts = totalPosts;
        this.isTotalLoading = false;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public initFilters(): void {
    const storageFilters = localStorage.getItem(this.session.getLocalStorageNameMapper('filters'))!;

    if (storageFilters) {
      this.activeFilters = JSON.parse(storageFilters!);

      this.filters.map((f) => {
        if (f.name !== 'saved-filters') {
          f.value = this.activeFilters[f.name];
          this.updateFilterSelectedText(f);
        }
      });
      this.applyFilters();
    }

    const activeSaved = JSON.parse(
      localStorage.getItem(this.session.getLocalStorageNameMapper('activeSavedSearch')) || 'null',
    );

    if (activeSaved) {
      this.router.navigate(['search', activeSaved]);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['activatedSavedFilterId'] && changes['activatedSavedFilterId'].currentValue) {
      this.clearAllFilters();
      this.savedsearchesService.getById(changes['activatedSavedFilterId'].currentValue).subscribe({
        next: (response) => {
          this.activeSavedFilter = response.result;
          const savedFilters = this.filters.find((f) => f.name === 'saved-filters')!;
          savedFilters.selected = response.result.name;
          savedFilters.value = response.result.id;
          this.updateFilterSelectedText(savedFilters);
          this.preparingSavedFilter();
        },
      });
    }
  }

  private async preparingSavedFilter(): Promise<void> {
    if (this.activeSavedFilter) {
      if (
        this.activeSavedFilter.filter.form &&
        !Array.isArray(this.activeSavedFilter.filter.form)
      ) {
        this.activeSavedFilter.filter.form = [this.activeSavedFilter.filter.form];
      }
      if (
        this.activeSavedFilter.filter.status &&
        !Array.isArray(this.activeSavedFilter.filter.status)
      ) {
        this.activeSavedFilter.filter.status = [this.activeSavedFilter.filter.status];
      }
      if (
        this.activeSavedFilter.filter.tags &&
        !Array.isArray(this.activeSavedFilter.filter.tags)
      ) {
        this.activeSavedFilter.filter.tags = [this.activeSavedFilter.filter.tags];
      }
      if (
        this.activeSavedFilter.filter.source &&
        !Array.isArray(this.activeSavedFilter.filter.source)
      ) {
        this.activeSavedFilter.filter.source = [this.activeSavedFilter.filter.source];
      }
      if (this.activeSavedFilter.filter.date_after || this.activeSavedFilter.filter.date_before) {
        this.activeSavedFilter.filter.date = {
          from: this.activeSavedFilter.filter.date_after,
          to: this.activeSavedFilter.filter.date_before,
        };
      } else {
        this.activeSavedFilter.filter.center_point = this.getFilterDefaultValue('date');
      }
      if (this.activeSavedFilter.filter.center_point?.length) {
        const latLng = this.activeSavedFilter.filter.center_point.split(',');
        this.activeSavedFilter.filter.center_point = {
          location: {
            lat: Number(latLng[0]),
            lon: Number(latLng[1]),
            label: await this.getLocationLabel(latLng[0], latLng[1]),
          },
          radius: this.activeSavedFilter.filter.within_km ?? 1,
        };
      } else {
        this.activeSavedFilter.filter.center_point = this.getFilterDefaultValue('center_point');
      }
      delete this.activeSavedFilter.filter.q;
      delete this.activeSavedFilter.filter.date_after;
      delete this.activeSavedFilter.filter.date_before;
      delete this.activeSavedFilter.filter.within_km;
      delete this.activeSavedFilter.filter.published_to;
      delete this.activeSavedFilter.filter.has_location;
      delete this.activeSavedFilter.filter.current_stage;
      delete this.activeSavedFilter.filter.saved_search;
      delete this.activeSavedFilter.filter.orderby;
      delete this.activeSavedFilter.filter.order;
      delete this.activeSavedFilter.filter.order_unlocked_on_top;
      delete this.activeSavedFilter.filter.set;
      delete this.activeSavedFilter.filter.user;
      delete this.activeSavedFilter.filter.reactToFilters;
      delete this.activeSavedFilter.filter.random;
      delete this.activeSavedFilter.filter['saved-filters'];

      const keys = Object.keys(this.activeSavedFilter.filter);
      keys.reduce((acc: any[], key, index) => {
        const isLastKey = index === keys.length - 1;
        this.applyFilter(this.activeSavedFilter!.filter[key], key, isLastKey, isLastKey);
        return acc;
      }, []);
    }
  }

  private async getLocationLabel(lat: number, lon: number): Promise<string> {
    try {
      const response = await lastValueFrom(this.searchService.getLabel(lat, lon));
      return response?.display_name;
    } catch (error) {
      console.error('error: ', error);
      return '';
    }
  }

  private getSurveys(): void {
    const isDeplaymentChanged = this.surveys !== null;
    if (isDeplaymentChanged) {
      this.activeFilters = null;
    }
    this.surveys = null;
    this.surveysService.get().subscribe({
      next: (response) => {
        this.surveys = response.results;
        this.initSurveyFilters(isDeplaymentChanged);
      },
      error: () => {
        this.surveys = [];
        this.initSurveyFilters(isDeplaymentChanged);
      },
    });
  }

  private initSurveyFilters(isDeplaymentChanged: boolean): void {
    if (!this.surveys) return;
    const allSurveysChecked =
      isDeplaymentChanged ??
      JSON.parse(
        localStorage.getItem(this.session.getLocalStorageNameMapper('allSurveysChecked')) ||
          'false',
      );
    const formIds = new Set(this.activeFilters?.form ?? []);

    const formFilter = this.filters.find((f) => f.name === 'form')!;
    formFilter.options = this.surveys.map((survey: SurveyItem) => ({
      value: survey.id,
      label: survey.name,
      checked: allSurveysChecked || formIds.has(survey.id),
      info: survey.description,
    }));

    if (!this.activatedSavedFilterId) {
      if (!this.activeFilters) {
        const formValue = this.surveys.map((s: SurveyItem) => s.id);
        formFilter.value = formValue;
        this.activeFilters = _.cloneDeep(searchFormHelper.DEFAULT_FILTERS);
        this.activeFilters['form'] = formValue;
        this.applyFilters();
      } else {
        formFilter.value = this.surveys
          .filter((survey: SurveyItem) => formIds.has(survey.id) || allSurveysChecked)
          .map((survey: SurveyItem) => survey.id);
      }
    } else {
      if (!this.activeSavedFilter?.filter.form) {
        formFilter.value = this.surveys.map((s: SurveyItem) => s.id);
        this.activeFilters['form'] = this.surveys.map((s: SurveyItem) => s.id);
        this.applyFilters();
      }
    }

    if (formFilter.options?.length) {
      localStorage.setItem(
        this.session.getLocalStorageNameMapper('allSurveysChecked'),
        String(formFilter.options.length <= formFilter.value?.length),
      );
    }

    this.updateFilterSelectedText(formFilter);
    formFilter.selected = String(formFilter?.value?.length ?? 'none');
  }

  private getFilterDefaultValue(filterName: string): any {
    if (filterName === 'source') {
      return searchFormHelper.sources.map((s) => s.value);
    }
    if (filterName === 'form') {
      return this.filters
        .find((filter) => filter.name === 'form')
        ?.options?.map((survey) => survey.value);
    }
    if (filterName === 'saved-filters') {
      return this.activatedSavedFilterId;
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
    if (!this.surveys?.length) {
      this.getSurveys();
    }
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
      this.clearAllFilters();
      this.filtersModal.closeModal(true);
      this.router.navigate(['']);
    }
  }

  private clearAllFilters(): void {
    this.filters.map((f) => {
      if (f.name === 'form') {
        f.value = f.options?.map((o) => o.value);
      } else {
        f.value = this.getFilterDefaultValue(f.name);
      }
      this.activeFilters[f.name] = f.value;
      this.updateFilterSelectedText(f);
    });
    localStorage.setItem(this.session.getLocalStorageNameMapper('allSurveysChecked'), String(true));
    localStorage.setItem(this.session.getLocalStorageNameMapper('activeSavedSearch'), 'null');
    this.applyFilters();
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

  public applyFilter(
    value: any,
    filterName: string,
    removeSelectedFilter = true,
    applyFilters = true,
  ): void {
    const originalFilter = this.filters.find((f) => f.name === filterName)!;
    if (originalFilter.name === 'saved-filters') {
      if (value) {
        localStorage.setItem(
          this.session.getLocalStorageNameMapper('activeSavedSearch'),
          JSON.stringify(value),
        );
      } else {
        localStorage.removeItem(this.session.getLocalStorageNameMapper('activeSavedSearch'));
        this.clearAllFilters();
      }
      this.router.navigate(value ? ['search', value] : ['']);
      this.filtersModal.closeModal(true);
      return;
    }

    if (originalFilter.name === 'form' && originalFilter.options?.length) {
      localStorage.setItem(
        this.session.getLocalStorageNameMapper('allSurveysChecked'),
        String(originalFilter.options.length <= value.length),
      );
    }

    switch (originalFilter.name) {
      case 'date':
        originalFilter.value = {
          start: value.from || null,
          end: value.to || null,
        };
        break;

      case 'center_point':
        const location = value.location
          ? {
              lat: value.location.lat,
              lng: value.location.lon,
              label: value.location.label,
            }
          : null;
        originalFilter.value = {
          location,
          distance: value.radius ?? '',
        };
        break;

      default:
        originalFilter.value = value;
        break;
    }
    this.activeFilters[originalFilter.name] = originalFilter.value;
    this.updateFilterSelectedText(originalFilter);
    if (originalFilter.name === 'source' || originalFilter.name === 'form') {
      if (originalFilter.value.length > 1 && originalFilter.value.indexOf('none') > -1) {
        originalFilter.value.splice(originalFilter.value.indexOf('none'), 1);
      } else if (originalFilter.value.length === 0) {
        originalFilter.value.push('none');
      }
    }
    if (applyFilters) {
      this.applyFilters();
    }

    if (removeSelectedFilter) {
      this.selectedFilter = null;
    }
  }

  private updateFilterSelectedText(filter: FilterControl): void {
    switch (filter.name) {
      case 'date':
        if (!filter.value?.start || !filter.value?.start) {
          filter.selectedCount = 'All Time';
        } else {
          filter.selectedCount = `
            ${UTCHelper.toUTC(filter.value.start, 'DD MMM')}
            -
            ${UTCHelper.toUTC(filter.value.end, 'DD MMM')}
          `;
        }
        break;

      case 'center_point':
        if (filter.value?.location?.label?.length) {
          filter.selectedCount = `
            ${filter.value?.location.label} (${filter.value?.distance}km)
          `;
        } else {
          filter.selectedCount = 'All locations';
        }
        break;

      case 'saved-filters':
        filter.selected = this.activeSavedFilter?.name ?? 'none';
        break;

      default:
        filter.selected = filter.value?.length ? String(filter.value.length) : 'none';
        break;
    }
  }

  public clearFilter(filterName: string): void {
    if (this.selectedFilter) {
      this.applyFilter(this.getFilterDefaultValue(filterName), this.selectedFilter.name, false);
      this.selectedFilter = _.cloneDeep(this.filters.find((filter) => filter.name === filterName))!;
    }
  }

  private applyFilters(): void {
    delete this.activeFilters['saved-filters'];
    this.isTotalLoading = true;
    localStorage.setItem(
      this.session.getLocalStorageNameMapper('filters'),
      JSON.stringify(this.activeFilters),
    );
    this.postsService.applyFilters(this.activeFilters);
  }

  public addFilter(filterName: string): void {
    if (filterName === 'saved-filters') {
      this.isAddSavedFiltersMode = true;
    }
    this.selectedFilter = null;
  }

  public editFilter(filterName: string, option: FilterControlOption): void {
    if (filterName === 'saved-filters') {
      this.isAddSavedFiltersMode = true;
      this.selectedSavedFilter = option;
    }
    this.selectedFilter = null;
  }

  public async saveSavedFilters(): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: `${this.selectedSavedFilter ? 'Update' : 'Save'} filter name?`,
      inputs: [
        {
          placeholder: 'Filter name',
          value: this.selectedSavedFilter?.label,
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
      const filters: any = {};
      for (const key in this.activeFilters) {
        if (this.activeFilters[key]?.length) {
          filters[key.replace(/\[\]/g, '')] = this.activeFilters[key];
        }
        if (key === 'date') {
          if (this.activeFilters[key]?.start?.length) {
            filters['date_after'] = this.activeFilters[key].start;
          }
          if (this.activeFilters[key]?.end?.length) {
            filters['date_before'] = this.activeFilters[key].end;
          }
        }
        if (
          key === 'center_point' &&
          this.activeFilters[key]?.location.lat &&
          this.activeFilters[key]?.location.lng
        ) {
          filters['within_km'] = this.activeFilters[key].distance;
          filters[
            'center_point'
          ] = `${this.activeFilters[key].location.lat},${this.activeFilters[key].location.lng}`;
        }
      }

      delete filters['saved-filters'];

      const savedSearchParams = {
        filter: filters,
        name: result.data.values[0],
        description: '',
        featured: false,
        role: [],
        view: 'map',
      };

      if (!!this.selectedSavedFilter && this.selectedSavedFilter.value) {
        this.savedsearchesService
          .update(this.selectedSavedFilter.value, { ...savedSearchParams })
          .subscribe({
            next: () => {
              this.selectedSavedFilter = null;
              this.isAddSavedFiltersMode = false;
            },
            error: (err) => {
              console.error(err);
            },
          });
      } else {
        this.savedsearchesService.post({ ...savedSearchParams }).subscribe({
          next: () => {
            this.isAddSavedFiltersMode = false;
          },
          error: (err) => {
            console.error(err);
          },
        });
      }
    }
  }

  public cancelAddSavedFiltersMode(): void {
    this.selectedSavedFilter = null;
    this.isAddSavedFiltersMode = false;
  }

  public deleteFilterHandle(data: any): void {
    const { id } = data;
    if (this.activatedSavedFilterId === id) {
      this.applyFilter(null, 'saved-filters');
    }
  }
}
