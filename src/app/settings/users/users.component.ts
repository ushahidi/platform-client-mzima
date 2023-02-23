import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { GeoJsonFilter, UserResult } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService, UsersService, BreakpointService } from '@services';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  @ViewChild('dt') dt: Table;
  public isDesktop$ = this.breakpointService.isDesktop$;
  public isLoading = false;
  public users: UserResult[] = [];
  public selectedUsers: UserResult[] = [];
  public isShowActions = false;
  public params: GeoJsonFilter = {
    limit: 10,
    offset: 0,
    created_before_by_id: '',
    order: 'asc',
    q: '',
  };
  public total: number;

  constructor(
    private userService: UsersService,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
    private breakpointService: BreakpointService,
    private cdr: ChangeDetectorRef,
  ) {}

  public ngOnInit() {
    this.userService.totalUsers$.subscribe({
      next: (total) => (this.total = total),
    });
    this.cdr.detectChanges();
  }

  public getUsers(event?: LazyLoadEvent) {
    this.isLoading = true;
    this.params.offset = event?.first || 0;
    this.params.order = event?.sortOrder === 1 ? 'asc' : 'desc' || 'asc';
    this.params.q = event?.globalFilter || '';
    this.userService.getUsers('', { ...this.params }).subscribe({
      next: (response) => {
        this.users = response.results;
        this.isLoading = false;
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
    this.dt.filterGlobal(event.target.value, 'contains');
  }
}
