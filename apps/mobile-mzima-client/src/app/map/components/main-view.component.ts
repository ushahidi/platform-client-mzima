import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SavedsearchesService, PostsService, UserInterface } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { SessionService } from '@services';
import { Subject } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-main-view',
  template: '',
})
export abstract class MainViewComponent {
  searchId = '';
  collectionId: any = '';
  params: any = {
    limit: 200,
    offset: 0,
  };
  filters: any;
  public user: UserInterface;
  public $destroy = new Subject<boolean>();

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected postsService: PostsService,
    protected savedSearchesService: SavedsearchesService,
    protected sessionService: SessionService,
  ) {
    this.updateFilters();
  }

  public getUserData(): void {
    this.sessionService.currentUserData$.pipe(untilDestroyed(this)).subscribe({
      next: (userData) => {
        this.user = userData;
      },
    });
  }

  public updateFilters(): void {
    this.filters = JSON.parse(
      localStorage.getItem(this.sessionService.getLocalStorageNameMapper('filters')) ?? '{}',
    );
  }

  ionViewWillEnter(): void {
    this.$destroy.next(false);
  }

  ionViewWillLeave(): void {
    this.$destroy.next(true);
  }

  abstract loadData(): void;

  initCollection() {
    if (this.route.snapshot.data['view'] === 'collection') {
      this.collectionId = this.route.snapshot.paramMap.get('id');
      this.params.set = this.collectionId;
      this.postsService.applyFilters({
        ...this.postsService.normalizeFilter(this.filters),
        set: this.collectionId,
      });
    } else {
      this.collectionId = '';
      this.params.set = '';
      if (this.route.snapshot.data['view'] === 'search') {
        this.searchId = this.route.snapshot.paramMap.get('id')!;
        this.savedSearchesService.getById(this.searchId).subscribe((sSearch) => {
          this.postsService.applyFilters(Object.assign(sSearch.result.filter, { set: [] }));
        });
      }
    }
  }
}
