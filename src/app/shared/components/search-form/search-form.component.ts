import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { NavigationStart, Router } from '@angular/router';
import { searchFormHelper } from '@helpers';
import { CategoryInterface, CollectionResult, Savedsearch, SurveyItem } from '@models';
import { TranslateService } from '@ngx-translate/core';
import {
  CategoriesService,
  EventBusService,
  PostsService,
  SurveysService,
  EventType,
  SessionService,
  CollectionsService,
} from '@services';
import { BehaviorSubject, debounceTime, filter, forkJoin, map, Subject } from 'rxjs';
import { SavedsearchesService } from 'src/app/core/services/savedsearches.service';
import { SearchService } from 'src/app/core/services/search.service';
import { FilterType } from '../filter-control/filter-control.component';
import { SearchResponse } from '../location-selection/location-selection.component';
import { MultilevelSelectOption } from '../multilevel-select/multilevel-select.component';
import { SaveSearchModalComponent } from '../save-search-modal/save-search-modal.component';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent implements OnInit {
  public _array = Array;
  public filterType = FilterType;
  public form: FormGroup = this.formBuilder.group({
    query: [],
    status: [['published', 'draft']],
    tags: [],
    source: [],
    form: [],
    place: [''],
    date: [
      {
        start: '',
        end: '',
      },
    ],
    center_point: [
      {
        location: {
          lat: null,
          lng: null,
        },
        distance: 1,
      },
    ],
  });
  collectionInfo?: CollectionResult;
  public activeFilters: any;
  public savedsearches: Savedsearch[];
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
  isLoggedIn = false;

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
    private searchService: SearchService,
    private session: SessionService,
    private eventBusService: EventBusService,
  ) {
    this.getSavedFilters();

    const isFiltersVisible = localStorage.getItem('is_filters_visible');
    this.toggleFilters(isFiltersVisible ? JSON.parse(isFiltersVisible) : false);

    this.getSurveys();

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
    });

    this.router.events.pipe(filter((event) => event instanceof NavigationStart)).subscribe({
      next: (params: any) => {
        this.isMapView = params.url.includes('/map');
      },
    });

    this.form.valueChanges.subscribe({
      next: (values) => {
        const filters: any = {
          'source[]': values.source,
          'status[]': values.status,
          'form[]': values.form,
          'tags[]': values.tags,
          date_after: values.date.start ? new Date(values.date.start).toISOString() : null,
          date_before: values.date.end ? new Date(values.date.end).toISOString() : null,
          q: values.query,
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

        this.applyFilters();
      },
    });

    this.citiesOptions = new BehaviorSubject<any[]>([]);

    this.searchSubject.pipe(debounceTime(350)).subscribe({
      next: (query: string) => {
        this.searchService.get(query).subscribe({
          next: (response: SearchResponse[]) => {
            if (response?.length) {
              this.citiesOptions.next(response);
            } else {
              this.citiesOptions.next([
                {
                  disabled: true,
                  display_name: 'No results... Try to search by another phrase. ',
                },
              ]);
            }
          },
        });
      },
    });

    this.postsService.postsFilters$.subscribe({
      next: (res) => {
        const collectionId = typeof res.set === 'string' ? res.set : '';
        if (collectionId) {
          this.getCollectionInfo(collectionId);
        } else {
          this.collectionInfo = undefined;
        }
        this.getPostsStatistic();
      },
    });

    this.postsService.totalGeoPosts$.subscribe({
      next: (total) => {
        if (this.isMapView) {
          this.total = total;
        }
      },
    });

    this.postsService.totalPosts$.subscribe({
      next: (total) => {
        if (!this.isMapView) {
          this.total = total;
        }
      },
    });
  }

  ngOnInit(): void {
    this.isMapView = this.router.url === '/map';
    this.statuses.map((status) => {
      status.name = this.translate.instant(status.name);
    });

    this.session.isLogged$.subscribe((isLogged) => (this.isLoggedIn = isLogged));
  }

  private getCollectionInfo(id: string) {
    this.collectionsService.getById(id).subscribe((coll) => {
      this.collectionInfo = coll;
    });
  }

  clearCollection() {
    if (this.isMapView) {
      this.router.navigate(['/map']);
    } else {
      this.router.navigate(['/feed']);
    }
  }

  public getSurveys(): void {
    forkJoin([this.surveysService.get(), this.postsService.getPostStatistics()]).subscribe({
      next: (responses) => {
        const values = responses[1].totals.find((total: any) => total.key === 'form')?.values;
        this.surveyList = responses[0].results;

        values.map((value: any) => {
          const survey = this.surveyList.find((s) => s.id === value.id);
          if (!survey) return;
          survey.total = (survey.total || 0) + value.total;
        });

        this.sources.map(
          (source) =>
            (source.total = values
              .filter((value: any) => value.type === source.value)
              .reduce((acc: any, value: any) => {
                return acc + value.total;
              }, 0)),
        );
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
                location: {
                  lat: Number(latLng[0]),
                  lng: Number(latLng[1]),
                },
                distance: search.filter.within_km || 1,
              };
            }
          });

          return response;
        }),
      )
      .subscribe({
        next: (response) => {
          this.savedsearches = response.results;
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
          featured: result.featured,
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

  public applySavedFilter(value: number | null): void {
    this.activeSavedSearchValue = value;
    if (value === null) {
      this.resetForm();
      return;
    }

    this.activeSavedSearch = this.savedsearches.find((search) => search.id === value);

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
    this.resetForm();
  }

  public applyFilters(): void {
    this.postsService.applyFilters(this.activeFilters);
  }

  public resetForm(filters: any = {}): void {
    this.form.patchValue({
      query: '',
      status: ['published', 'draft'],
      tags: [],
      source: [],
      form: [],
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
    localStorage.setItem('is_filters_visible', JSON.stringify(this.isFiltersVisible));
    this.eventBusService.next({
      type: EventType.ToggleFiltersPanel,
      payload: this.isFiltersVisible,
    });
  }

  public clearFilter(filterName: string): void {
    this.form.controls[filterName].patchValue('');
  }

  public searchOnMap(): void {
    if (typeof this.searchQuery !== 'string') return;
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
}
