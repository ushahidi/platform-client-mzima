import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GeoJsonFilter, UsersService, UserResult } from '@mzima-client/sdk';
import { TranslateService } from '@ngx-translate/core';
import { BreakpointService } from '@services';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { debounceTime, forkJoin, Observable, Subject } from 'rxjs';
import { ConfirmModalService } from '../../core/services/confirm-modal.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  @ViewChild('dt') dt: Table;
  public isDesktop$: Observable<boolean>;
  public users: UserResult[] = [];
  public selectedUsers: UserResult[] = [];
  public isShowActions = false;
  public currentPage = 0;
  public params: GeoJsonFilter = {
    limit: 10,
    offset: this.currentPage * 10,
    created_before_by_id: '',
    order: 'asc',
    q: '',
    page: 1,
  };
  public total: number;
  private readonly searchSubject = new Subject<string>();

  constructor(
    private userService: UsersService,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private breakpointService: BreakpointService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
    this.currentPage = Number(this.activatedRoute.snapshot.queryParams['page'] ?? 1) - 1;

    this.searchSubject.pipe(debounceTime(350)).subscribe({
      next: (query: string) => {
        this.dt.filterGlobal(query, 'contains');
      },
    });
  }

  public ngOnInit() {
    this.userService.totalUsers$.pipe(untilDestroyed(this)).subscribe({
      next: (total) => (this.total = total),
    });
    this.cdr.detectChanges();
  }

  public getUsers(event?: LazyLoadEvent) {
    this.currentPage = (event?.first ?? 0) / 10;
    this.params.order = event?.sortOrder === 1 ? 'asc' : 'desc' || 'asc';
    this.params.q = event?.globalFilter || '';
    this.params.page = this.currentPage + 1;

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        page: this.params.page,
      },
      queryParamsHandling: 'merge',
    });

    this.userService.getUsers('', { ...this.params }).subscribe({
      next: (response) => {
        this.users = response.results;
        this.cdr.detectChanges();
      },
      error: (err) => console.log(err),
    });
  }

  public async deleteUsers() {
    const confirmed = await this.confirmModalService.open({
      title: this.translate.instant('notify.user.bulk_destroy_confirm', {
        count: this.selectedUsers.length,
      }),
      description: this.translate.instant('app.action_cannot_be_undone'),
      confirmButtonText: this.translate.instant('app.yes_delete'),
      cancelButtonText: this.translate.instant('app.no_go_back'),
    });
    if (!confirmed) return;
    forkJoin(this.selectedUsers.map((user) => this.userService.deleteUser(user.id))).subscribe({
      complete: () => {
        this.getUsers({
          first: this.params.offset,
          sortOrder: this.params.order === 'asc' ? 1 : 0,
          globalFilter: this.params.q,
        });
        this.selectedUsers = [];
      },
    });
  }

  public showActions(event: boolean) {
    this.isShowActions = event;
    if (!event) this.selectedUsers = [];
  }

  public globalSearch(event: any) {
    this.searchSubject.next(event.target.value);
  }
}
