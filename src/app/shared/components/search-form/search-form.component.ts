import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { searchFormHelper } from '@helpers';
import { CategoryInterface, CollectionResult, Savedsearch, SurveyItem } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { TranslateService } from '@ngx-translate/core';
import {
  CategoriesService,
  EventBusService,
  PostsService,
  SurveysService,
  EventType,
  SessionService,
  CollectionsService,
  BreakpointService,
  SavedsearchesService,
} from '@services';
import { BehaviorSubject, debounceTime, filter, forkJoin, lastValueFrom, map, Subject } from 'rxjs';
import { FilterType } from '../filter-control/filter-control.component';
import { SearchResponse } from '../location-selection/location-selection.component';
import { MultilevelSelectOption } from '../multilevel-select/multilevel-select.component';
import { SaveSearchModalComponent } from '../save-search-modal/save-search-modal.component';

@UntilDestroy()
@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent implements OnInit {
  public isDesktop$ = this.breakpointService.isDesktop$;
  private postsFilters$ = this.postsService.postsFilters$.pipe(untilDestroyed(this));
  private totalGeoPosts$ = this.postsService.totalGeoPosts$.pipe(untilDestroyed(this));
  private totalPosts$ = this.postsService.totalPosts$.pipe(untilDestroyed(this));
  private isMainFiltersHidden$ = this.session.isMainFiltersHidden$.pipe(untilDestroyed(this));
  private userData$ = this.session.currentUserData$.pipe(untilDestroyed(this));
  private isFiltersVisible$ = this.session.isFiltersVisible$.pipe(untilDestroyed(this));
  public _array = Array;
  public filterType = FilterType;
  public form: FormGroup = this.formBuilder.group(searchFormHelper.DEFAULT_FILTERS);
  public collectionInfo?: CollectionResult;
  public activeFilters: any;
  public savedSearches: Savedsearch[];
  public statuses = searchFormHelper.statuses;
  public surveyList: SurveyItem[] = [];
  public sources = searchFormHelper.sources;
  public categoriesData: MultilevelSelectOption[];
  public activeSavedSearch?: Savedsearch;
  public activeSavedSearchValue: number | null = null;
  public total: number;
  public isMapView: boolean;
  public isFiltersVisible: boolean;
  public searchQuery: string;
  private readonly searchSubject = new Subject<string>();
  public citiesOptions: BehaviorSubject<(SearchResponse | any)[]>;
  public notShownPostsCount: number;
  public showSources: boolean;
  public isLoggedIn = false;
  public isMainFiltersOpen = true;
  public surveysLoaded: boolean;
  public isOnboardingActive: boolean;
  private defaultFormValue = this.formBuilder.group(searchFormHelper.DEFAULT_FILTERS).value;
  public filters = localStorage.getItem(this.session.localStorageNameMapper('filters'));
  public activeSaved = localStorage.getItem(
    this.session.localStorageNameMapper('activeSavedSearch'),
  );

  constructor(
    private formBuilder: FormBuilder,
    private savedsearchesService: SavedsearchesService,
    private surveysService: SurveysService,
    private categoriesService: CategoriesService,
    private collectionsService: CollectionsService,
    private dialog: MatDialog,
    private postsService: PostsService,
    private router: Router,
    private translate: TranslateService,
    private session: SessionService,
    private eventBusService: EventBusService,
    private breakpointService: BreakpointService,
  ) {
    this.getSavedFilters();
    this.getSurveys();

    if (this.filters) {
      const filters = JSON.parse(this.filters!);
      this.updateForm(filters);
      this.getActiveFilters(filters);
      this.applyFilters();
    } else {
      localStorage.setItem(
        this.session.localStorageNameMapper('filters'),
        JSON.stringify(this.form.value),
      );
    }

    if (this.activeSaved) {
      this.activeSavedSearch = JSON.parse(this.activeSaved!);
      this.activeSavedSearchValue = this.activeSavedSearch!.id || null;
      this.preparingSavedFilter();
    }

    this.getCategories();

    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe({
      next: (params: any) => {
        this.isMapView = params.url.includes('/map');
      },
    });

    this.form.valueChanges.subscribe({
      next: (values) => {
        localStorage.setItem(
          this.session.localStorageNameMapper('filters'),
          JSON.stringify(values),
        );
        this.getActiveFilters(values);
        this.applyFilters();
      },
    });

    this.citiesOptions = new BehaviorSubject<any[]>([]);

    this.searchSubject.pipe(debounceTime(700)).subscribe({
      next: () => {
        this.getActiveFilters(this.form.value);
        this.applyFilters();
      },
    });
  }

  getPostsFilters() {
    this.postsFilters$.subscribe({
      next: (res) => {
        if (res.set) {
          const collectionId = typeof res.set === 'string' ? res.set : '';
          if (collectionId) {
            this.getCollectionInfo(collectionId);
          } else {
            this.collectionInfo = undefined;
          }
        }
        this.getPostsStatistic();
      },
      error: (err) => console.log('postsFilters:', err),
    });
  }

  ngOnInit(): void {
    this.eventBusInit();

    this.isMapView = this.router.url.includes('/map');

    this.userData$.subscribe((userData) => {
      this.isLoggedIn = !!userData.userId;
      this.getSavedFilters();
    });

    this.isFiltersVisible$.subscribe((isVisible) => (this.isFiltersVisible = isVisible));
    this.getPostsFilters();

    // this.getTotalPosts();

    this.isMainFiltersHidden$.subscribe({
      next: (isMainFiltersHidden: boolean) => {
        setTimeout(() => {
          this.isMainFiltersOpen = !isMainFiltersHidden;
        }, 1);
      },
      error: (err) => console.log('isMainFiltersHidden:', err),
    });
  }

  private getTotalPosts() {
    this.totalGeoPosts$.subscribe({
      next: (total) => {
        if (this.isMapView) {
          this.total = total;
        }
      },
      error: (err) => console.log('totalGeoPosts:', err),
    });

    this.totalPosts$.subscribe({
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
        this.categoriesData = response?.results?.map((category: CategoryInterface) => {
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
      date_after: values.date.start ? new Date(values.date.start).toISOString() : null,
      date_before: values.date.end ? new Date(values.date.end).toISOString() : null,
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
    this.collectionsService.getById(id).subscribe({
      next: (coll) => {
        this.collectionInfo = coll;
      },
      error: (err) => console.log('getCollectionInfo:', err),
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
        this.surveyList.map((survey) => (survey.checked = true));
        this.surveyList.map((survey) => (survey.total = survey.total || 0));

        values.map((value: any) => {
          const survey = this.surveyList.find((s) => s.id === value.id);
          if (!survey) return;
          survey.total = (survey.total || 0) + value.total;
        });

        this.total = this.getTotal(this.surveyList);

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

  public getPostsStatistic(): void {
    this.postsService.getPostStatistics().subscribe({
      next: (res) => {
        this.notShownPostsCount = res.unmapped;

        if (this.surveyList?.length) {
          this.surveyList.map((survey) => (survey.total = 0));
          const values = res.totals.find((total: any) => total.key === 'form')?.values;

          values.map((value: any) => {
            const survey = this.surveyList.find((s) => s.id === value.id);
            if (!survey) return;
            survey.total = (survey.total || 0) + value.total;
          });
        }
      },
    });
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
          response.results.map((search) => {
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
      },
    });
  }

  async setSavedFilter(value: number) {
    if (this.savedSearches) {
      this.activeSavedSearch = this.savedSearches.find((search) => search.id === value);
      localStorage.setItem(
        this.session.localStorageNameMapper('activeSavedSearch'),
        JSON.stringify(this.activeSavedSearch),
      );
    } else {
      this.activeSavedSearch = await lastValueFrom(this.savedsearchesService.getById(value));
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
      localStorage.removeItem(this.session.localStorageNameMapper('activeSavedSearch'));
      this.resetSavedFilter();
    }
  }

  async getSavedValues(value: number) {
    this.activeSavedSearchValue = value;
    if (value === null) {
      localStorage.removeItem(this.session.localStorageNameMapper('activeSavedSearch'));
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
    this.activeSavedSearch = undefined;
    this.activeSavedSearchValue = null;
    localStorage.removeItem(this.session.localStorageNameMapper('activeSavedSearch'));
    this.resetForm();
    this.clearCollection();
    this.defaultFormValue = this.form.value;
  }

  public applyFilters(): void {
    this.postsService.applyFilters(this.activeFilters);
  }

  public applyAndClose(): void {
    this.applyFilters();
    this.toggleFilters(false);
  }

  public resetForm(filters: any = {}): void {
    this.form.patchValue(Object.assign(searchFormHelper.DEFAULT_FILTERS, filters));
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

  surveyChanged(event: any) {
    let arr: any[] = [];
    for (const element of event.source._value) {
      arr.push(...this.surveyList.filter((el) => el.id === element));
    }
    this.total = this.getTotal(arr);
  }
}
