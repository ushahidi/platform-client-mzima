import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { NavigationStart, Router } from '@angular/router';
import { searchFormHelper } from '@helpers';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { EventBusService, EventType, SessionService, BreakpointService } from '@services';
import {
  BehaviorSubject,
  debounceTime,
  filter,
  forkJoin,
  lastValueFrom,
  map,
  Observable,
  Subject,
  switchMap,
} from 'rxjs';
import { BaseComponent } from '../../../base.component';
import { FilterType } from '../filter-control/filter-control.component';
import { SearchResponse } from '../location-selection/location-selection.component';
import { MultilevelSelectOption } from '../multilevel-select/multilevel-select.component';
import { SaveSearchModalComponent } from '../save-search-modal/save-search-modal.component';
import {
  CategoriesService,
  CollectionsService,
  NotificationsService,
  SavedsearchesService,
  SurveysService,
  PostsService,
  CategoryInterface,
  CollectionResult,
  Savedsearch,
  SurveyItem,
  AccountNotificationsInterface,
  GeoJsonFilter,
  apiHelpers,
} from '@mzima-client/sdk';
import dayjs from 'dayjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import {
  DEFAULT_FILTERS,
  DEFAULT_FILTERS_LOGGED_OUT,
  DEFAULT_STATUSES_LOGGED_IN,
  DEFAULT_STATUSES_LOGGED_OUT,
  loggedOutStatuses,
} from '../../../core/helpers/search-form';

@UntilDestroy()
@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent extends BaseComponent implements OnInit {
  public _array = Array;
  public filterType = FilterType;
  public form: FormGroup;
  public collectionInfo?: CollectionResult;
  public activeFilters: any;
  public savedSearches: Savedsearch[];
  public surveyList: SurveyItem[] = [];
  public statuses = loggedOutStatuses;
  public sources = searchFormHelper.sources;
  public categoriesData: MultilevelSelectOption[];
  public activeSavedSearch?: Savedsearch;
  public activeSavedSearchValue: number | null = null;
  public total: number;
  public isMapView: boolean;
  public isFiltersVisible: boolean;
  public searchQuery: string;
  private readonly searchSubject = new Subject<string>();
  public citiesOptions = new BehaviorSubject<any[]>([]);
  public notMappedPostsCount: number;
  public isMainFiltersOpen = true;
  public surveysLoaded: boolean;
  public isOnboardingActive: boolean;
  private defaultFormValue: any;
  public filters: string;
  public activeSaved: string;
  public notification?: AccountNotificationsInterface;
  public isNotificationsOn: boolean;
  public isNotificationLoading: boolean;

  constructor(
    protected override sessionService: SessionService,
    protected override breakpointService: BreakpointService,
    private formBuilder: FormBuilder,
    private savedsearchesService: SavedsearchesService,
    private surveysService: SurveysService,
    private categoriesService: CategoriesService,
    private collectionsService: CollectionsService,
    private dialog: MatDialog,
    private postsService: PostsService,
    private router: Router,
    private session: SessionService,
    private eventBusService: EventBusService,
    private notificationsService: NotificationsService,
    private snackBar: MatSnackBar,
    private translate: TranslateService,
  ) {
    super(sessionService, breakpointService);
    this.checkDesktop();

    let defaultFilters = searchFormHelper.DEFAULT_FILTERS_LOGGED_OUT;
    if (this.isLoggedIn) {
      defaultFilters = searchFormHelper.DEFAULT_FILTERS;
    }

    this.form = this.formBuilder.group(defaultFilters);
    this.defaultFormValue = this.formBuilder.group(defaultFilters).value;
    this.filters = localStorage.getItem(this.session.getLocalStorageNameMapper('filters'))!;
    this.activeSaved = localStorage.getItem(
      this.session.getLocalStorageNameMapper('activeSavedSearch'),
    )!;
  }

  ngOnInit(): void {
    this.isMapView = this.router.url.includes('/map');
    this.eventBusInit();
    this.getSavedFilters();
    this.initFilters();
    this.getSurveys();
    this.getCategories();
    this.getUserData();

    if (this.activeSaved) {
      this.activeSavedSearch = JSON.parse(this.activeSaved!);
      this.activeSavedSearchValue = this.activeSavedSearch!.id || null;
      this.preparingSavedFilter();
      this.checkSavedSearchNotifications();
    }

    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe({
      next: (params: any) => {
        this.isMapView = params.url.includes('/map');
        this.applyFilters(false);
      },
    });

    this.form.valueChanges.pipe(debounceTime(500), untilDestroyed(this)).subscribe({
      next: (values) => {
        if (this.collectionInfo?.id) {
          values.set = this.collectionInfo.id.toString();
        }
        localStorage.setItem(
          this.session.getLocalStorageNameMapper('filters'),
          JSON.stringify(values),
        );
        if (values?.form) {
          localStorage.setItem(
            this.session.getLocalStorageNameMapper('allSurveysChecked'),
            JSON.stringify(values.form.length === this.surveyList.length),
          );
        }
        this.getActiveFilters(values);
        this.applyFilters();
      },
    });

    this.searchSubject.pipe(debounceTime(700)).subscribe({
      next: () => {
        this.getActiveFilters(this.form.value);
        this.applyFilters();
      },
    });

    this.session.isFiltersVisible$
      .pipe(untilDestroyed(this))
      .subscribe((isVisible) => (this.isFiltersVisible = isVisible));

    this.session.isMainFiltersHidden$.pipe(untilDestroyed(this)).subscribe({
      next: (isMainFiltersHidden: boolean) => {
        setTimeout(() => {
          this.isMainFiltersOpen = !isMainFiltersHidden;
          if (this.isMainFiltersOpen) {
            document.body.classList.remove('main-filters-closed');
          } else {
            document.body.classList.add('main-filters-closed');
          }
        }, 1);
      },
      error: (err) => console.log('isMainFiltersHidden:', err),
    });

    this.session.currentUserData$.pipe(untilDestroyed(this)).subscribe({
      next: (currentUser) => {
        if (this.activeFilters && this.activeFilters['status[]']) {
          const existingStatuses = this.activeFilters['status[]'];
          const newStatuses = currentUser.role
            ? DEFAULT_STATUSES_LOGGED_IN
            : DEFAULT_STATUSES_LOGGED_OUT;
          if (
            existingStatuses.length !== newStatuses.length ||
            existingStatuses.every(
              (element: string, index: number) => element !== newStatuses[index],
            )
          ) {
            this.activeFilters['status[]'] = newStatuses;
            this.form.get('status')?.enable();
            this.form.patchValue({ status: newStatuses }, { onlySelf: false, emitEvent: true });
          }
        }
      },
    });

    this.getPostsFilters();
    this.getTotalPosts();
  }

  loadData(): void {
    this.getSavedFilters();
    this.getPostsStatistic();
    if (this.isLoggedIn) {
      this.statuses = searchFormHelper.statuses;
      if (this.collectionInfo) {
        this.getNotification(String(this.collectionInfo.id));
      }
    } else {
      this.statuses = searchFormHelper.loggedOutStatuses;
    }
  }

  private initFilters() {
    this.clearPostsResults();
    if (this.filters) {
      const filters = JSON.parse(this.filters!);
      if (!this.router.url.includes('collection')) {
        // clear collection info if we left collection route
        delete filters.set;
      }
      this.updateForm(filters);
      this.getActiveFilters(filters);
      this.applyFilters(false);
    } else {
      localStorage.setItem(
        this.session.getLocalStorageNameMapper('filters'),
        JSON.stringify(this.form.value),
      );
    }
  }

  getPostsFilters() {
    this.postsService.postsFilters$
      .pipe(
        untilDestroyed(this),
        switchMap((res) => {
          if (res.set) {
            const collectionId = typeof res.set === 'string' ? res.set : '';
            if (collectionId) {
              this.getCollectionInfo(collectionId);
              const withSet = Object.assign({}, this.form.value, { set: collectionId });
              localStorage.setItem(
                this.session.getLocalStorageNameMapper('filters'),
                JSON.stringify(withSet),
              );
            } else {
              localStorage.setItem(
                this.session.getLocalStorageNameMapper('filters'),
                JSON.stringify(this.form.value),
              );
              this.collectionInfo = undefined;
            }
          }
          return this.getPostsStatistic();
        }),
      )
      .subscribe({
        error: (err) => console.log('postsFilters:', err),
      });
  }

  private getTotalPosts() {
    this.postsService.totalGeoPosts$.pipe(untilDestroyed(this)).subscribe({
      next: (total) => {
        if (this.isMapView) {
          this.total = total;
        }
      },
      error: (err) => console.log('totalGeoPosts:', err),
    });

    this.postsService.totalPosts$.pipe(untilDestroyed(this)).subscribe({
      next: (total) => {
        if (!this.isMapView) {
          this.total = total;
        }
      },
      error: (err) => console.log('totalPosts:', err),
    });
  }

  private eventBusInit() {
    this.eventBusService.on(EventType.SavedSearchInit).subscribe({
      next: async (sSearch) => {
        await this.getSavedValues(parseFloat(sSearch));
      },
    });

    this.eventBusService.on(EventType.RefreshSurveysCounters).subscribe({
      next: () => this.getSurveys(),
    });

    this.eventBusService.on(EventType.ShowOnboarding).subscribe({
      next: () => (this.isOnboardingActive = true),
    });

    this.eventBusService.on(EventType.FinishOnboarding).subscribe({
      next: () => (this.isOnboardingActive = false),
    });

    this.eventBusService.on(EventType.DeleteSavedSearch).subscribe({
      next: () => this.applySavedFilter(null),
    });

    this.eventBusService.on(EventType.UpdateSavedSearch).subscribe({
      next: (savedSearch) => {
        if (this.activeSavedSearch) {
          this.activeSavedSearch.name = savedSearch.name;
          this.activeSavedSearch.description = savedSearch.description;
          if (this.isLoggedIn) {
            this.checkSavedSearchNotifications();
          }
        }
      },
    });
  }

  private getCategories() {
    this.categoriesService
      .getCategories({ only: apiHelpers.ONLY.TAG_ID_PARENTID_CHILDREN })
      .subscribe({
        next: (response) => {
          const mainResults = response?.results.filter((c: CategoryInterface) => !c.parent_id);
          this.categoriesData = mainResults?.map((category: CategoryInterface) => {
            return {
              id: category.id,
              name: category.tag,
              children: category?.children?.map((cat: CategoryInterface) => {
                return {
                  id: cat.id,
                  name: cat.tag,
                };
              }),
            };
          });
          if (!this.categoriesData.length) {
            document.body.classList.add('filters-panel-no-categories');
          } else {
            document.body.classList.remove('filters-panel-no-categories');
          }
        },
        error: (err) => {
          if (err.message.match(/Http failure response for/)) {
            setTimeout(() => this.getCategories(), 2000);
          }
        },
      });
  }

  private getActiveFilters(values: any): void {
    // Check if values.form contains an item with id 0
    let fetchPostsWithoutFormId = false;
    if (!this.isMapView && Array.isArray(values.form)) {
      const index = values.form.findIndex((id: any) => id === 0);
      fetchPostsWithoutFormId = index !== -1;
    }

    const filters: GeoJsonFilter = {
      'source[]': values.source,
      'status[]': values.status,
      'form[]': values.form,
      'tags[]': values.tags,
      currentView: this.isMapView ? 'map' : 'feed',
      include_unstructured_posts: fetchPostsWithoutFormId,
      set: values.set,
      date_after: values.date.start ? dayjs(values.date.start).toISOString() : undefined,
      date_before: values.date.end
        ? dayjs(values.date.end)
            .endOf('day')
            .add(dayjs(values.date.end).utcOffset(), 'minute')
            .toISOString()
        : undefined,
      q: this.searchQuery,
      center_point:
        values.center_point?.location?.lat && values.center_point?.location?.lng
          ? [values.center_point.location.lat, values.center_point.location.lng].join(',')
          : undefined,
      within_km: values.center_point.distance,
    };

    this.activeFilters = {};
    for (const key in filters) {
      const val = filters[key as keyof typeof filters];
      if (val === undefined) continue;
      this.activeFilters[key] = val;
    }
  }

  private getCollectionInfo(id: string) {
    this.eventBusService
      .on(EventType.UpdateCollection)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (colId) => {
          this.collectionsService.getById(colId).subscribe({
            next: (coll) => {
              this.collectionInfo = coll.result;
            },
          });
        },
      });
    this.collectionsService.getById(id).subscribe({
      next: (coll) => {
        this.collectionInfo = coll.result;
        this.activeSavedSearch = undefined;
        this.activeSavedSearchValue = null;
        localStorage.removeItem(this.session.getLocalStorageNameMapper('activeSavedSearch'));
        if (this.isLoggedIn) {
          this.getNotification(id);
        }
      },
      error: (err) => {
        if (err.status === 403) {
          this.snackBar.open(this.translate.instant('collection.errors.permissions'), 'Close', {
            panelClass: ['error'],
            duration: 5000,
          });
          this.router.navigate([this.router.url.includes('/feed') ? '/feed' : '/map']);
        } else {
          console.log('getCollectionInfo:', err);
        }
      },
    });
  }

  private getNotification(id: string): void {
    if (!this.collectionInfo) return;

    this.isNotificationLoading = true;
    this.notificationsService.get(id).subscribe({
      next: (response) => {
        this.notification = response.results[0];
        this.isNotificationsOn = !!this.notification;
        this.isNotificationLoading = false;
      },
      error: () => {
        this.isNotificationLoading = false;
      },
    });
  }

  clearCollection() {
    if (this.isMapView) {
      this.router.navigate(['/map']);
    } else {
      this.router.navigate(['/feed']);
    }
  }

  getTotal(surveyList: SurveyItem[]) {
    return surveyList.reduce((acc, survey) => acc + survey.total!, 0);
  }

  public getSurveys(): void {
    this.surveysLoaded = false;

    forkJoin([
      this.surveysService.getSurveys('', {
        only: apiHelpers.ONLY.NAME_ID_COLOR,
        show_unknown_form: true,
      }),
      this.getPostsStatistic(),
    ]).subscribe({
      next: (responses) => {
        const values = responses[1].result.group_by_total_posts;
        this.surveyList = responses[0].results;
        if (this.filters) {
          const data = JSON.parse(this.filters);
          const formIds = new Set(data.form);

          const allSurveysChecked = JSON.parse(
            localStorage.getItem(this.session.getLocalStorageNameMapper('allSurveysChecked')) ||
              'false',
          );

          this.surveyList.forEach((survey) => {
            survey.checked = allSurveysChecked || formIds.has(survey.id);
          });

          localStorage.setItem(
            this.session.getLocalStorageNameMapper('allSurveysChecked'),
            JSON.stringify(!this.surveyList.find((survey) => !survey.checked)),
          );
        } else {
          this.surveyList.forEach((survey) => (survey.checked = true));
        }

        this.surveyList.map((survey) => (survey.total = survey.total || 0));

        this.calculateCounters(values);

        this.surveysLoaded = true;
      },
      error: (err) => {
        if (err.message.match(/Http failure response for/)) {
          setTimeout(() => this.getSurveys(), 5000);
        }
      },
    });
  }

  private calculateCounters(values: any) {
    if (this.surveyList?.length) {
      this.surveyList.map((survey) => (survey.total = 0));
      values.map((value: any) => {
        const survey = this.surveyList.find((s) => s.id === value.id);
        if (!survey) return;
        if (this.form.controls['source'].value.includes(value.source)) {
          // Exclude unchecked sources
          survey.total = (survey.total || 0) + value.total;
        }
      });
    }

    if (this.sources?.length) {
      this.sources.map(
        (src) =>
          (src.total = values
            .filter((value: any) => value.source === src.value)
            .filter((value: any) => this.form.controls['form'].value.includes(value.id)) // Exclude unchecked surveys
            .reduce((acc: any, value: any) => acc + value.total, 0)),
      );
    }
  }

  public getPostsStatistic(): Observable<any> {
    return this.postsService.getPostStatistics(this.activeFilters).pipe(
      map((res) => {
        this.notMappedPostsCount = res.result.unmapped;
        const values = res.result.group_by_total_posts;
        this.calculateCounters(values);
        return res;
      }),
    );
  }

  get isEditAvailable() {
    return this.isLoggedIn;
  }

  get canCreateSearch() {
    return this.isLoggedIn && !this.collectionInfo;
  }

  private getSavedFilters(): void {
    this.savedsearchesService
      .get()
      .pipe(
        map((response) => {
          response.results.map((search: any) => {
            if (search.filter?.status === 'all') {
              search.filter.status = ['published', 'draft', 'archived'];
            }

            if (search.filter?.center_point || search.filter?.within_km) {
              const latLng = search.filter.center_point?.split(',');
              search.filter.center_point = {
                distance: search.filter.within_km || 1,
              };
              if (latLng) {
                search.filter.center_point.location = {
                  lat: parseFloat(latLng[0]),
                  lng: parseFloat(latLng[1]),
                };
              }
            }
          });

          return response;
        }),
      )
      .subscribe({
        next: (response) => {
          this.savedSearches = response.results;
          this.savedSearches.map((search) => {
            return (search.checked = !!(
              this.activeSavedSearch && search.id === this.activeSavedSearch!.id
            ));
          });
        },
        error: (err) => {
          if (err.message.match(/Http failure response for/)) {
            setTimeout(() => this.getSavedFilters(), 5000);
          }
        },
      });
  }

  public setSortingValue(option: any, value: any): boolean {
    return option.order === value.order && option.orderBy === value.orderBy;
  }

  public saveSearch(search?: Savedsearch): void {
    const dialogRef = this.dialog.open(SaveSearchModalComponent, {
      width: '100%',
      maxWidth: 576,
      height: 'auto',
      maxHeight: '90vh',
      panelClass: 'modal',
      data: {
        search,
        activeFilters: this.activeFilters,
        activeSavedSearch: this.activeSavedSearch,
      },
    });

    dialogRef.afterClosed().subscribe({
      next: () => {
        this.form.enable();
        this.getSavedFilters();
      },
    });
  }

  async setSavedFilter(value: number) {
    if (this.savedSearches) {
      this.activeSavedSearch = this.savedSearches.find((search) => search.id === value);
      this.checkSavedSearchNotifications();
      localStorage.setItem(
        this.session.getLocalStorageNameMapper('activeSavedSearch'),
        JSON.stringify(this.activeSavedSearch),
      );
    } else {
      const activeSavedSearch = await lastValueFrom(this.savedsearchesService.getById(value));
      this.activeSavedSearch = activeSavedSearch.result;
      this.checkSavedSearchNotifications();
    }
    localStorage.setItem(
      this.session.getLocalStorageNameMapper('filters'),
      JSON.stringify(this.activeSavedSearch!.filter),
    );
  }

  async applySavedFilter(value: number | null) {
    if (value) {
      await this.setSavedFilter(value);
      this.router.navigate([
        `/`,
        this.activeSavedSearch?.view === 'map' ? 'map' : 'feed',
        'search',
        value,
      ]);
    } else {
      localStorage.removeItem(this.session.getLocalStorageNameMapper('activeSavedSearch'));
      this.resetSavedFilter();
    }
  }

  async getSavedValues(value: number) {
    this.activeSavedSearchValue = value;
    if (value === null) {
      localStorage.removeItem(this.session.getLocalStorageNameMapper('activeSavedSearch'));
      this.resetForm();
      return;
    }

    await this.setSavedFilter(value);
    this.preparingSavedFilter();
    this.defaultFormValue = this.form.value;
  }

  private preparingSavedFilter() {
    if (this.activeSavedSearch) {
      if (
        this.activeSavedSearch.filter.form &&
        !this._array.isArray(this.activeSavedSearch.filter.form)
      ) {
        this.activeSavedSearch.filter.form = [this.activeSavedSearch.filter.form];
      }
      if (
        this.activeSavedSearch.filter.status &&
        !this._array.isArray(this.activeSavedSearch.filter.status)
      ) {
        this.activeSavedSearch.filter.status = [this.activeSavedSearch.filter.status];
      }
      if (
        this.activeSavedSearch.filter.tags &&
        !this._array.isArray(this.activeSavedSearch.filter.tags)
      ) {
        this.activeSavedSearch.filter.tags = [this.activeSavedSearch.filter.tags];
      }
      if (
        this.activeSavedSearch.filter.source &&
        !this._array.isArray(this.activeSavedSearch.filter.source)
      ) {
        this.activeSavedSearch.filter.source = [this.activeSavedSearch.filter.source];
      }

      this.activeSavedSearch.filter.currentView = this.activeSavedSearch.view;

      this.resetForm(this.activeSavedSearch.filter);
    } else {
      this.resetForm();
    }
  }

  public resetSavedFilter(): void {
    localStorage.removeItem(this.session.getLocalStorageNameMapper('filters'));
    localStorage.removeItem(this.session.getLocalStorageNameMapper('activeSavedSearch'));
    this.clearSavedFilter();
    this.resetForm();
    this.defaultFormValue = this.formBuilder.group(searchFormHelper.DEFAULT_FILTERS).value;
  }

  public applyFilters(updated = true): void {
    this.postsService.applyFilters(this.activeFilters, updated);
  }

  public applyAndClose(): void {
    this.applyFilters();
    this.toggleFilters(false);
  }

  public resetForm(filters: any = {}): void {
    let fetchPostsWithoutFormId = false;
    // Check if this.surveyList contains an item with id 0
    if (!this.isMapView) {
      const index = this.surveyList.findIndex((s) => s.id === 0);
      fetchPostsWithoutFormId = index !== -1;
    }

    this.activeFilters = this.isLoggedIn ? DEFAULT_FILTERS : DEFAULT_FILTERS_LOGGED_OUT;
    this.form.patchValue({
      query: '',
      status: this.isLoggedIn ? DEFAULT_STATUSES_LOGGED_IN : DEFAULT_STATUSES_LOGGED_OUT,
      tags: [],
      source: this.sources.map((s) => s.value),
      form: this.surveyList.map((s) => s.id),
      include_unstructured_posts: fetchPostsWithoutFormId,
      date: {
        start: '',
        end: '',
      },
      date_before: '',
      date_after: '',
      place: '',
      center_point: {
        location: {
          lat: null,
          lng: null,
        },
        distance: 1,
      },
      ...filters,
    });
  }

  public toggleFilters(value: boolean): void {
    if (value === this.isFiltersVisible) return;
    this.isFiltersVisible = value;
    this.session.toggleFiltersVisibility(value);
  }

  public clearFilter(filterName: string): void {
    this.total = 0;
    this.form.controls[filterName].patchValue('');
  }

  public showAllButton(filterName: string) {
    return (
      JSON.stringify(this.form.controls[filterName].getRawValue()) === JSON.stringify(['none'])
    );
  }

  public toggleSidebarFilters(filterName: string): void {
    let newValue;
    if (this.showAllButton(filterName)) {
      if (filterName === 'form') {
        newValue = this.surveyList.map((survey: any) => {
          return survey.id;
        });
      }
      if (filterName === 'source') {
        newValue = this.sources.map((source: any) => {
          return source.value;
        });
      }
    } else {
      this.total = 0;
      newValue = ['none'];
    }
    this.form.controls[filterName].patchValue(newValue);
  }

  public searchPosts(): void {
    this.searchSubject.next(this.searchQuery);
    //------------------------
    // Save to localstorage: Needed for "search + filter" detection for posts ("no posts" message display particularly)
    localStorage.setItem('USH_searchPostByKeyword', this.searchQuery);
    //------------------------
  }

  public displayFn(city: SearchResponse): string {
    return city?.display_name || '';
  }

  public optionSelected(event: MatAutocompleteSelectedEvent): void {
    this.eventBusService.next({
      type: EventType.SearchOptionSelected,
      payload: event.option.value,
    });
  }

  public clearPostsResults(): void {
    this.searchQuery = '';
    this.searchPosts();
  }

  private updateForm(filters: any) {
    Object.keys(filters).forEach((key: string) => {
      if (this.form.controls[key]) {
        this.form.controls[key].patchValue(filters[key]);
      }
    });
  }

  public toggleMainFilters(): void {
    this.session.toggleMainFiltersVisibility(this.isMainFiltersOpen);
  }

  public clearSavedFilter(): void {
    this.activeSavedSearch = undefined;
    this.activeSavedSearchValue = null;
    localStorage.removeItem(this.session.getLocalStorageNameMapper('activeSavedSearch'));
    this.clearCollection();
    this.notification = undefined;
    this.isNotificationLoading = false;
    this.isNotificationsOn = false;
  }

  public changeNorificationStatus(event: MatSlideToggleChange, set: string): void {
    if (event.checked && !this.notification) {
      this.isNotificationLoading = true;
      this.notificationsService.post({ set_id: set }).subscribe({
        next: (notification) => {
          this.notification = notification.result;
          this.isNotificationLoading = false;
        },
        error: () => {
          this.notification = undefined;
          this.isNotificationLoading = false;
        },
      });
    } else if (!event.checked && this.notification) {
      this.isNotificationLoading = true;
      this.notificationsService.delete(this.notification.id).subscribe({
        next: () => {
          this.notification = undefined;
          this.isNotificationLoading = false;
        },
        error: () => {
          this.notification = undefined;
          this.isNotificationLoading = false;
        },
      });
    }
  }

  private checkSavedSearchNotifications(): void {
    if (!this.activeSavedSearch) return;

    this.isNotificationLoading = true;
    this.notificationsService.get(String(this.activeSavedSearch.id)).subscribe({
      next: (response) => {
        this.notification = response.results[0];
        this.isNotificationsOn = !!this.notification;
        this.isNotificationLoading = false;
      },
    });
  }
}
