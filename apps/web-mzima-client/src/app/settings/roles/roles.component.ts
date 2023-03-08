import { Component, OnInit } from '@angular/core';
import { RoleResponse } from '@models';
import { Observable } from 'rxjs';
import {RolesService} from "../../core/services/roles.service";
import {BreakpointService} from "../../core/services/breakpoint.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
// import { RolesService, BreakpointService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  public isDesktop$: Observable<boolean>;
  public roleResponse$: Observable<RoleResponse>;

  constructor(private rolesService: RolesService, private breakpointService: BreakpointService) {
  this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
  }

  ngOnInit() {
    this.getRoles();
  }

  private getRoles() {
    this.roleResponse$ = this.rolesService.get();
  }
}
