import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RoleResponse, UserResult } from '@models';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmModalService, RolesService, UsersService } from '@services';
import { forkJoin, Observable, take } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['select', 'avatar', 'realname', 'email', 'role'];
  dataSource: MatTableDataSource<UserResult>;
  selection: SelectionModel<UserResult> = new SelectionModel<UserResult>(true, []);
  public roleResponse$: Observable<RoleResponse>;
  selectedRole: string;
  isLoading = false;

  constructor(
    private userService: UsersService,
    private rolesService: RolesService,
    private confirmModalService: ConfirmModalService,
    private translate: TranslateService,
  ) {}

  public ngOnInit() {
    this.getUsers();
    this.getRoles();
  }

  private getUsers() {
    this.isLoading = true;
    this.userService.getUsers().subscribe({
      next: (response) => {
        this.dataSource = new MatTableDataSource<UserResult>(response.results);
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
    });
  }

  private getRoles() {
    this.roleResponse$ = this.rolesService.get();
  }

  public isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  public masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  public async deleteUsers() {
    const confirmed = await this.openConfirmModal(
      'User will be deleted!',
      '<p>This action cannot be undone.</p><p>Are you sure?</p>',
    );
    if (!confirmed) return;
    const join = [];
    for (const user of this.selection.selected) {
      join.push(this.userService.deleteUser(user.id));
    }
    forkJoin(join)
      .pipe(take(1))
      .subscribe({
        next: () => this.initialData(),
        error: (e) => console.log(e),
      });
  }

  public changeRole() {
    const join = [];
    for (const user of this.selection.selected) {
      join.push(this.userService.updateUserById(user.id, { id: user.id, role: this.selectedRole }));
    }
    forkJoin(join)
      .pipe(take(1))
      .subscribe({
        next: () => this.initialData(),
        error: (e) => console.log(e),
      });
  }

  private initialData() {
    this.getUsers();
    this.selectedRole = '';
    this.selection.clear();
  }

  private async openConfirmModal(title: string, description: string): Promise<boolean> {
    return this.confirmModalService.open({
      title: this.translate.instant(title),
      description: this.translate.instant(description),
    });
  }
}
