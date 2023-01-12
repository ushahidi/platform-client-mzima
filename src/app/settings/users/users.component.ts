import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { GeoJsonFilter, UserResult } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService, RolesService, UsersService } from '@services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  @ViewChild('user') public userRef: ElementRef;
  isLoading = false;

  users: UserResult[] = [];
  selectedUsers: number[] = [];
  public isShowActions = false;
  public params: GeoJsonFilter = {
    limit: 9,
    offset: 0,
    created_before_by_id: '',
  };
  public pagination = {
    page: 1,
    size: this.params.limit,
  };
  public total: number;

  constructor(
    private userService: UsersService,
    private rolesService: RolesService,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
  ) {}

  public ngOnInit() {
    this.getUsers(this.params);
    this.userService.totalUsers$.subscribe({
      next: (total) => (this.total = total),
    });
  }

  private getUsers(params: any, add?: boolean) {
    if (!add) {
      this.users = [];
    }
    this.isLoading = true;
    this.userService.getUsers('', { ...params }).subscribe({
      next: (response) => {
        this.users = add ? [...this.users, ...response.results] : response.results;
        setTimeout(() => {
          this.isLoading = false;
          if (
            this.userRef?.nativeElement.offsetHeight &&
            this.userRef?.nativeElement.offsetHeight >= this.userRef?.nativeElement.scrollHeight
          ) {
            this.loadMore();
          }
        });
      },
    });
  }

  public async deleteUsers() {
    const confirmed = this.confirmModalService.open({
      title: this.translate.instant('notify.user.bulk_destroy_confirm', {
        count: this.selectedUsers.length,
      }),
      description: this.translate.instant('app.action_cannot_be_undone'),
      confirmButtonText: this.translate.instant('app.yes_delete'),
      cancelButtonText: this.translate.instant('app.no_go_back'),
    });
    if (!confirmed) return;
    forkJoin(this.selectedUsers.map((userId) => this.userService.deleteUser(userId))).subscribe({
      complete: () => {
        this.getUsers(this.params);
        this.selectedUsers = [];
      },
    });
  }

  public showActions(event: boolean) {
    this.isShowActions = event;
    if (!event) this.selectedUsers = [];
  }

  public selectUser(event: MatCheckboxChange, { id }: UserResult) {
    if (event.checked) {
      this.selectedUsers.push(id);
    } else {
      const index = this.selectedUsers.findIndex((userId) => userId === id);
      if (index > -1) {
        this.selectedUsers.splice(index, 1);
      }
    }
  }

  public selectAllUsers(event: MatCheckboxChange) {
    if (event.checked) {
      this.users.map((user) => {
        if (this.selectedUsers.find((selectedUser) => selectedUser === user.id)) return;
        this.selectedUsers.push(user.id);
      });
    } else {
      this.selectedUsers = [];
    }
  }

  public loadMore() {
    if (
      this.params.offset !== undefined &&
      this.params.limit !== undefined &&
      this.params.offset + this.params.limit < this.total
    ) {
      this.params.offset = this.params.offset + this.params.limit;
      this.getUsers(this.params, true);
    }
  }

  public onScroll(event: any): void {
    if (
      !this.isLoading &&
      event.target.offsetHeight + event.target.scrollTop >= event.target.scrollHeight - 32
    ) {
      this.loadMore();
    }
  }
}
