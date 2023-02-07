import { Component, OnInit } from '@angular/core';
import { RoleResponse } from '@models';
import { Observable } from 'rxjs';
import { RolesService, BreakpointService } from '@services';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  public isDesktop$ = this.breakpointService.isDesktop$;
  public roleResponse$: Observable<RoleResponse>;

  constructor(private rolesService: RolesService, private breakpointService: BreakpointService) {}

  ngOnInit() {
    this.getRoles();
  }

  private getRoles() {
    this.roleResponse$ = this.rolesService.get();
  }
}
