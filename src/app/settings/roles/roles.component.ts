import { Component, OnInit } from '@angular/core';
import { RoleResponse } from '@models';
import { Observable } from 'rxjs';
import { RolesService } from '@services';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  public roleResponse$: Observable<RoleResponse>;

  constructor(private rolesService: RolesService) {}

  ngOnInit() {
    this.getRoles();
  }

  private getRoles() {
    this.roleResponse$ = this.rolesService.get();
  }
}
