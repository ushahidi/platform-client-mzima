import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormControlComponent } from '@components';
import { PostResult, PostsService } from '@mzima-client/sdk';
import { Subject, debounceTime, lastValueFrom } from 'rxjs';
import { AlertService } from '@services';
import { FilterControl } from '@models';
import { searchFormHelper } from '@helpers';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-search-form',
  templateUrl: './search-form.component.html',
  styleUrls: ['./search-form.component.scss'],
})
export class SearchFormComponent {
  @Input() public isLight = true;
  public isResultsVisible = false;
  @ViewChild('formControl') formControl: FormControlComponent;
  private readonly searchSubject = new Subject<string>();
  public posts: PostResult[] = [];
  public isPostsLoading = false;
  public isFiltersModalOpen = false;
  public totalPosts = 356;
  public filters: FilterControl[] = [
    {
      name: 'set',
      icon: 'saved-filters',
      label: 'Saved filters',
      selected: 'none',
      selectedLabel: 'Selected:',
      selectedCount: 3,
      value: null,
    },
    {
      name: 'form',
      icon: 'surveys',
      label: 'Surveys',
      selected: 'none',
      selectedCount: 16,
      value: null,
    },
    {
      name: 'source',
      icon: 'sources',
      label: 'Sources',
      selected: 'none',
      selectedCount: searchFormHelper.sources.length,
      value: null,
    },
    {
      name: 'status',
      icon: 'status',
      label: 'Status',
      selected: 'none',
      selectedCount: searchFormHelper.statuses.length,
      value: null,
    },
    {
      name: 'tags',
      icon: 'categories',
      label: 'Categories',
      selected: 'none',
      selectedCount: 20,
      value: null,
    },
    {
      name: 'date',
      icon: 'calendar',
      label: 'Date range',
      selectedLabel: 'Select the date range',
      selectedCount: 'All Time',
      value: null,
    },
    {
      name: 'location',
      icon: 'marker',
      label: 'Location',
      selectedLabel: 'Select locations',
      selectedCount: 'All locations',
      value: null,
    },
  ];
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
  ) {
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

  public async handleClearFilters(filterName?: string): Promise<void> {
    const result = await this.alertService.presentAlert({
      header: !filterName?.length ? 'Clear all filters?' : `Clear ${filterName} filter?`,
      message: !filterName?.length
        ? `All filters except <strong>Surveys</strong>, <strong>Sources</strong> and <strong>Status</strong> will be cleared`
        : 'This filter will be cleared',
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
      // TODO: Clear filters
      console.log(!filterName?.length ? 'clear all filters' : 'clear filter: ' + filterName);
    }
  }

  public openFilter(filter: FilterControl): void {
    this.selectedFilter = filter;
  }

  public modalCloseHandle(): void {
    if (!this.selectedFilter) {
      this.isFiltersModalOpen = false;
    }
    this.selectedFilter = null;
  }

  public applyFilter(): void {
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
}
