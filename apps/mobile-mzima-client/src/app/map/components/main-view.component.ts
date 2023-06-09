import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SavedsearchesService, PostsService, UserInterface } from '@mzima-client/sdk';
import { UntilDestroy } from '@ngneat/until-destroy';
import { SessionService } from '@services';
import { Subject } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-main-view',
  template: '',
})
export abstract class MainViewComponent {
  searchId = '';
  collectionId = '';
  params: any = {
    limit: 200,
    offset: 0,
  };
  filters;
  public user: UserInterface;
  public $destroy = new Subject();

  constructor(
    protected router: Router,
    protected route: ActivatedRoute,
    protected postsService: PostsService,
    protected savedSearchesService: SavedsearchesService,
    protected sessionService: SessionService,
  ) {
    this.filters = JSON.parse(
      localStorage.getItem(this.sessionService.getLocalStorageNameMapper('filters'))!,
    );
  }

  ionViewWillLeave(): void {
    this.$destroy.next(null);
    this.$destroy.complete();
  }

  abstract loadData(): void;

  initCollection() {
    this.collectionId = '';
    this.params.set = '';

    switch (this.route.snapshot.data['view']) {
      case 'collection':
        this.collectionId = this.route.snapshot.paramMap.get('id')!;
        this.params.set = this.collectionId;
        this.postsService.applyFilters({
          ...this.normalizeFilter(this.filters),
          set: this.collectionId,
        });
        this.searchId = '';
        break;

      case 'search':
        this.searchId = this.route.snapshot.paramMap.get('id')!;
        this.savedSearchesService.getById(this.searchId).subscribe((sSearch) => {
          this.postsService.applyFilters(Object.assign(sSearch.result.filter, { set: [] }));
        });
        break;

      default:
        this.searchId = '';
        this.postsService.applyFilters({
          ...this.normalizeFilter(this.filters),
          set: [],
        });
        break;
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
}
