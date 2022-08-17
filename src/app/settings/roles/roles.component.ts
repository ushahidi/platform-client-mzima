import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { RolesService } from '@services';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss'],
})
export class RolesComponent implements OnInit {
  public roleList$: Observable<any>;

  constructor(private rolesService: RolesService) {}

  ngOnInit() {
    this.getRoles();
  }

  private getRoles() {
    this.roleList$ = this.rolesService.get();
  }
}
