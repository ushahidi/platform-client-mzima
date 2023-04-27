import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { NavigationStart, Router } from '@angular/router';
import { searchFormHelper } from '@helpers';
import { AccountNotificationsInterface } from '@models';
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
} from '@mzima-client/sdk';
import dayjs from 'dayjs';

@UntilDestroy()
@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent implements OnInit {
  public isDesktop$: Observable<boolean>;
  public _array = Array;
  public filterType = FilterType;
  public form: FormGroup;
  public collectionInfo?: CollectionResult;
  public activeFilters: any;
  public savedSearches: Savedsearch[];
  public surveyList: SurveyItem[] = [];
  public statuses = searchFormHelper.statuses;
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
  public notShownPostsCount: number;
  public showSources: boolean;
  public isLoggedIn = false;
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
    private breakpointService: BreakpointService,
    private notificationsService: NotificationsService,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
    this.form = this.formBuilder.group(searchFormHelper.DEFAULT_FILTERS);
    this.defaultFormValue = this.formBuilder.group(searchFormHelper.DEFAULT_FILTERS).value;
    this.filters = localStorage.getItem(this.session.getLocalStorageNameMapper('filters'))!;
    this.activeSaved = localStorage.getItem(
      this.session.getLocalStorageNameMapper('activeSavedSearch'),
    )!;
  }

  ngOnInit(): void {
    this.eventBusInit();
    this.getSavedFilters();
    this.getSurveys();
    this.getCategories();

    if (this.filters) {
      const filters = JSON.parse(this.filters!);
      this.updateForm(filters);
      this.getActiveFilters(filters);
      this.applyFilters();
    } else {
      localStorage.setItem(
        this.session.getLocalStorageNameMapper('filters'),
        JSON.stringify(this.form.value),
      );
    }

    if (this.activeSaved) {
      this.activeSavedSearch = JSON.parse(this.activeSaved!);
      this.activeSavedSearchValue = this.activeSavedSearch!.id || null;
      this.preparingSavedFilter();
      this.checkSavedSearchNotifications();
    }

    this.isMapView = this.router.url.includes('/map');
    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe({
      next: (params: any) => {
        this.isMapView = params.url.includes('/map');
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

    this.session.currentUserData$.pipe(untilDestroyed(this)).subscribe((userData) => {
      this.isLoggedIn = !!userData.userId;
      this.getSavedFilters();
      this.getPostsStatistic();
      if (this.isLoggedIn && this.collectionInfo) {
        this.getNotification(String(this.collectionInfo.id));
      }
    });

    this.session.isFiltersVisible$
      .pipe(untilDestroyed(this))
      .subscribe((isVisible) => (this.isFiltersVisible = isVisible));

    this.session.isMainFiltersHidden$.pipe(untilDestroyed(this)).subscribe({
      next: (isMainFiltersHidden: boolean) => {
        setTimeout(() => {
          this.isMainFiltersOpen = !isMainFiltersHidden;
        }, 1);
      },
      error: (err) => console.log('isMainFiltersHidden:', err),
    });

    this.getPostsFilters();
    this.getTotalPosts();
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

    this.eventBusService.on(EventType.ShowOnboarding).subscribe({
      next: () => (this.isOnboardingActive = true),
    });

    this.eventBusService.on(EventType.FinishOnboarding).subscribe({
      next: () => (this.isOnboardingActive = false),
    });
  }

  private getCategories() {
    this.categoriesService.get().subscribe({
      next: (response) => {
        const mainResults = response?.results.filter((c: CategoryInterface) => !c.parent_id);
        this.categoriesData = mainResults?.map((category: CategoryInterface) => {
          return {
            id: category.id,
            name: category.tag,
            children: response?.results
              ?.filter((cat: CategoryInterface) => cat.parent_id === category.id)
              .map((cat: CategoryInterface) => {
                return {
                  id: cat.id,
                  name: cat.tag,
                };
              }),
          };
        });
      },
      error: (err) => {
        if (err.message.match(/Http failure response for/)) {
          setTimeout(() => this.getCategories(), 2000);
        }
      },
    });
  }

  private getActiveFilters(values: any): void {
    const filters: any = {
      'source[]': values.source,
      'status[]': values.status,
      'form[]': values.form,
      'tags[]': values.tags,
      set: values.set,
      date_after: values.date.start ? dayjs(values.date.start).toISOString() : null,
      date_before: values.date.end
        ? dayjs(values.date.end)
            .endOf('day')
            .add(dayjs(values.date.end).utcOffset(), 'minute')
            .toISOString()
        : null,
      q: this.searchQuery,
      center_point:
        values.center_point?.location?.lat && values.center_point?.location?.lng
          ? [values.center_point.location.lat, values.center_point.location.lng].join(',')
          : null,
      within_km: values.center_point.distance,
    };

    this.activeFilters = {};
    for (const key in filters) {
      if (!filters[key] && !filters[key]?.length) continue;
      this.activeFilters[key] = filters[key];
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
      error: (err) => console.log('getCollectionInfo:', err),
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

    forkJoin([this.surveysService.get(), this.postsService.getPostStatistics()]).subscribe({
      next: (responses) => {
        const values = responses[1].totals.find((total: any) => total.key === 'form')?.values;
        this.surveyList = responses[0].results;

        if (this.filters) {
          const data = JSON.parse(this.filters);
          const formIds = new Set(data.form);

          this.surveyList.forEach((survey) => {
            survey.checked = formIds.has(survey.id);
          });
        } else {
          this.surveyList.forEach((survey) => (survey.checked = true));
        }

        this.surveyList.map((survey) => (survey.total = survey.total || 0));

        values.map((value: any) => {
          const survey = this.surveyList.find((s) => s.id === value.id);
          if (!survey) return;
          survey.total = (survey.total || 0) + value.total;
        });

        // this.total = this.total || this.getTotal(this.surveyList);

        this.sources.map(
          (source) =>
            (source.total = values
              .filter((value: any) => value.type === source.value)
              .reduce((acc: any, value: any) => acc + value.total, 0)),
        );

        this.surveysLoaded = true;

        this.showSources = !!this.sources?.find((source) => source.total > 0);
      },
      error: (err) => {
        if (err.message.match(/Http failure response for/)) {
          setTimeout(() => this.getSurveys(), 5000);
        }
      },
    });
  }

  public getPostsStatistic(): Observable<any> {
    return this.postsService.getPostStatistics().pipe(
      map((res) => {
        this.notShownPostsCount = res.unmapped;
        const values = res.totals.find((total: any) => total.key === 'form')?.values;

        if (this.surveyList?.length) {
          this.surveyList.map((survey) => (survey.total = 0));
          values.map((value: any) => {
            const survey = this.surveyList.find((s) => s.id === value.id);
            if (!survey) return;
            if (this.form.controls['source'].value.includes(value.type)) {
              // Exclude unchecked sources
              survey.total = (survey.total || 0) + value.total;
            }
          });

          // this.total = this.getTotal(this.surveyList);
        }

        if (this.sources?.length) {
          this.sources.map(
            (src) =>
              (src.total = values
                .filter((value: any) => value.type === src.value)
                .filter((value: any) => this.form.controls['form'].value.includes(value.id)) // Exclude unchecked surveys
                .reduce((acc: any, value: any) => acc + value.total, 0)),
          );
        }

        return res;
      }),
    );
  }

  get isEditAvailable() {
    return this.form.dirty && this.isLoggedIn;
  }

  get canCreateSearch() {
    return (
      this.isLoggedIn &&
      !this.collectionInfo &&
      searchFormHelper.compareForms(this.form.value, this.defaultFormValue)
    );
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
      },
    });

    dialogRef.afterClosed().subscribe({
      next: (result: any) => {
        if (!result || result === 'cancel') return;

        if (result === 'delete') {
          if (search?.id) {
            this.savedsearchesService.delete(search.id).subscribe({
              next: () => {
                this.form.enable();
                this.resetSavedFilter();
                this.getSavedFilters();
              },
            });
          }
          return;
        }

        this.form.disable();

        const filters: any = {};
        for (const key in this.activeFilters) {
          filters[key.replace(/\[\]/g, '')] = this.activeFilters[key];
        }

        const savedSearchParams = {
          filter: filters,
          name: result.name,
          description: result.description,
          featured: result.visible_to.value === 'only_me',
          role: result.visible_to.value === 'specific' ? result.visible_to.options : ['admin'],
          view: result.defaultViewingMode,
        };

        if (search?.id) {
          this.savedsearchesService
            .update(search.id, {
              ...this.activeSavedSearch,
              ...savedSearchParams,
            })
            .subscribe({
              next: () => {
                this.form.enable();
                this.getSavedFilters();
              },
            });
        } else {
          this.savedsearchesService
            .post({
              ...savedSearchParams,
            })
            .subscribe({
              next: () => {
                this.form.enable();
                this.getSavedFilters();
              },
            });
        }

        if (search) {
          this.notificationsService.get(String(search.id)).subscribe({
            next: (response) => {
              const notification = response.results[0];
              if (!notification && result.is_notifications_enabled) {
                this.notificationsService.post({ set: String(search.id) }).subscribe();
              } else if (notification && !result.is_notifications_enabled) {
                this.notificationsService.delete(notification.id).subscribe();
              }
            },
          });
        }
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

      this.resetForm(this.activeSavedSearch.filter);
    } else {
      this.resetForm();
    }
  }

  public resetSavedFilter(): void {
    this.clearSavedFilter();
    this.resetForm();
    this.defaultFormValue = this.formBuilder.group(searchFormHelper.DEFAULT_FILTERS).value;
  }

  public applyFilters(): void {
    this.postsService.applyFilters(this.activeFilters);
  }

  public applyAndClose(): void {
    this.applyFilters();
    this.toggleFilters(false);
  }

  public resetForm(filters: any = {}): void {
    this.form.patchValue({
      query: '',
      status: ['published', 'draft'],
      tags: [],
      source: this.sources.map((s) => s.value),
      form: this.surveyList.map((s) => s.id),
      date: {
        start: '',
        end: '',
      },
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

  public searchPosts(): void {
    this.searchSubject.next(this.searchQuery);
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
      this.notificationsService.post({ set }).subscribe({
        next: (notification) => {
          this.notification = notification;
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
