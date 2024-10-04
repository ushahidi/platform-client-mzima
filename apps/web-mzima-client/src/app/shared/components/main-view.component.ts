import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  SavedsearchesService,
  PostsService,
  UserInterface,
  GeoJsonFilter,
} from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreakpointService, EventBusService, EventType, SessionService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-main-view',
  template: '',
})
export abstract class MainViewComponent {
  searchId = '';
  collectionId = '';
  params: GeoJsonFilter = {
    limit: 500,
    offset: 0,
  };
  cachedFilter: string;
  public user: UserInterface;
  public isDesktop: boolean = false;

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected postsService: PostsService,
    protected savedSearchesService: SavedsearchesService,
    protected eventBusService: EventBusService,
    protected sessionService: SessionService,
    protected breakpointService: BreakpointService,
  ) {
    const cachedFilter = localStorage.getItem(
      this.sessionService.getLocalStorageNameMapper('filters'),
    );
    this.params = cachedFilter ? JSON.parse(cachedFilter) : this.params;
  }

  abstract loadData(): void;

  initCollection() {
    if (this.route.snapshot.data['view'] === 'collection') {
      this.collectionId = this.route.snapshot.paramMap.get('id')!;
      this.params.set = this.collectionId;
      this.postsService.applyFilters({
        ...this.normalizeFilter(this.params),
        set: this.collectionId,
      });
      this.searchId = '';
    } else {
      this.collectionId = '';
      this.params.set = '';
      if (this.route.snapshot.data['view'] === 'search') {
        this.searchId = this.route.snapshot.paramMap.get('id')!;
        this.savedSearchesService.getById(this.searchId).subscribe((sSearch) => {
          this.postsService.applyFilters(Object.assign(sSearch.result.filter, { set: [] }));
          this.eventBusService.next({
            type: EventType.SavedSearchInit,
            payload: this.searchId,
          });
        });
      } else {
        this.searchId = '';
        this.postsService.applyFilters({
          ...this.normalizeFilter(this.params),
          set: [],
        });
      }
    }
  }

  private normalizeFilter(values: GeoJsonFilter): GeoJsonFilter {
    if (!values) return {};

    const filters = {
      ...values,
      'form[]': values['form[]'],
      'source[]': values['source[]'],
      'status[]': values['status[]'],
      'tags[]': values['tags[]'],
    };

    return filters;
  }

  getUserData(): void {
    this.sessionService.currentUserData$.pipe(untilDestroyed(this)).subscribe({
      next: (userData) => {
        this.user = userData;
        this.loadData();
      },
    });
  }

  initCollectionRemoveListener() {
    this.eventBusService.on(EventType.DeleteCollection).subscribe({
      next: (colId) => {
        if (Number(colId) === Number(this.collectionId)) {
          this.router.navigate(['/map']);
        }
      },
    });

    this.eventBusService.on(EventType.DeleteSavedSearch).subscribe({
      next: () => {
        // We can delete search only from edit so redirect anyway
        this.router.navigate(['/map']);
      },
    });
  }

  public checkDesktop() {
    this.breakpointService.isDesktop$.pipe(untilDestroyed(this)).subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }
}
