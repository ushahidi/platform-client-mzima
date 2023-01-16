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
  public roleResponse$: Observable<RoleResponse>;
  public isDesktop = false;

  constructor(private rolesService: RolesService, private breakpointService: BreakpointService) {
    this.breakpointService.isDesktop.subscribe({
      next: (isDesktop) => {
        this.isDesktop = isDesktop;
      },
    });
  }

  ngOnInit() {
    this.getRoles();
  }

  private getRoles() {
    this.roleResponse$ = this.rolesService.get();
  }
}
