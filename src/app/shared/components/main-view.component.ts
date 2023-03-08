import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserInterface } from '@models';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  EventBusService,
  EventType,
  PostsService,
  SavedsearchesService,
  SessionService,
} from '@services';

@UntilDestroy()
@Component({
  selector: 'app-main-view',
  template: '',
})
export class MainViewComponent {
  searchId = '';
  collectionId = '';
  params: any = {
    limit: 200,
    offset: 0,
  };
  filters = JSON.parse(
    localStorage.getItem(this.sessionService.localStorageNameMapper('filters'))!,
  );
  public user: UserInterface;

  userData$ = this.sessionService.currentUserData$.pipe(untilDestroyed(this));

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected postsService: PostsService,
    protected savedSearchesService: SavedsearchesService,
    protected eventBusService: EventBusService,
    protected sessionService: SessionService,
  ) {}

  initCollection() {
    if (this.route.snapshot.data['view'] === 'collection') {
      this.collectionId = this.route.snapshot.paramMap.get('id')!;
      this.params.set = this.collectionId;
      this.postsService.applyFilters({
        ...this.normalizeFilter(this.filters),
        set: this.collectionId,
      });
      this.searchId = '';
    } else {
      this.collectionId = '';
      this.params.set = '';
      if (this.route.snapshot.data['view'] === 'search') {
        this.searchId = this.route.snapshot.paramMap.get('id')!;
        this.savedSearchesService.getById(this.searchId).subscribe((sSearch) => {
          this.postsService.applyFilters(Object.assign(sSearch.filter, { set: [] }));
          this.eventBusService.next({
            type: EventType.SavedSearchInit,
            payload: this.searchId,
          });
        });
      } else {
        this.searchId = '';
        this.postsService.applyFilters({
          ...this.normalizeFilter(this.filters),
          set: [],
        });
      }
    }
  }

  private normalizeFilter(values: any) {
    const filters = {
      ...values,
      'form[]': values.form,
      'source[]': values.source,
      'status[]': values.status,
      'tags[]': values.tags,
    };

    delete filters.form;
    delete filters.source;
    delete filters.status;
    delete filters.tags;
    return filters;
  }

  getUserData(): void {
    this.userData$.subscribe({
      next: (userData) => (this.user = userData),
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
  }
}
