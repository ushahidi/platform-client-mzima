import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RolesService, RolesResponse } from '@mzima-client/sdk';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { BreakpointService } from '@services';

@UntilDestroy()
@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  public isDesktop$: Observable<boolean>;
  public roleResponse$: Observable<RolesResponse>;

  constructor(private rolesService: RolesService, private breakpointService: BreakpointService) {
    this.isDesktop$ = this.breakpointService.isDesktop$.pipe(untilDestroyed(this));
  }

  ngOnInit() {
    this.getRoles();
  }

  private getRoles() {
    this.roleResponse$ = this.rolesService.getRoles();
  }
}
