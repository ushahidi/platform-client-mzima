import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { FormControlComponent } from '@components';
import { PostResult } from '@mzima-client/sdk';
import { Subject, debounceTime } from 'rxjs';
import { AlertService } from '@services';
import { FilterControl } from '@models';
import { searchFormHelper } from '@helpers';

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
    },
    {
      name: 'form',
      icon: 'surveys',
      label: 'Surveys',
      selected: 'none',
      selectedCount: 16,
    },
    {
      name: 'source',
      icon: 'sources',
      label: 'Sources',
      selected: 'none',
      selectedCount: searchFormHelper.sources.length,
    },
    {
      name: 'status',
      icon: 'status',
      label: 'Status',
      selected: 'none',
      selectedCount: searchFormHelper.statuses.length,
    },
    {
      name: 'tags',
      icon: 'categories',
      label: 'Categories',
      selected: 'none',
      selectedCount: 20,
    },
    {
      name: 'date',
      icon: 'calendar',
      label: 'Date range',
      selectedLabel: 'Select the date range',
      selectedCount: 'All Time',
    },
    {
      name: 'location',
      icon: 'marker',
      label: 'Location',
      selectedLabel: 'Select locations',
      selectedCount: 'All locations',
    },
  ];
  public selectedFilter: FilterControl | null;

  public form = this.formBuilder.group({
    postsQuery: [''],
  });

  constructor(private formBuilder: FormBuilder, private alertService: AlertService) {
    this.searchSubject.pipe(debounceTime(500)).subscribe({
      next: (query: string) => {
        console.log('search query: ', query);
        setTimeout(() => {
          this.isPostsLoading = false;
        }, 1000);
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

  public showFiltersModal(e: Event): void {
    e.preventDefault();
    e.stopPropagation();
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
}
