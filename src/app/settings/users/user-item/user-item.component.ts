import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleResult, UserInterface } from '@models';
import { RolesService, UsersService } from '@services';

@Component({
  selector: 'app-user-item',
  templateUrl: './user-item.component.html',
  styleUrls: ['./user-item.component.scss'],
})
export class UserItemComponent implements OnInit {
  public isUpdate = false;
  public roles: RoleResult[];
  public form: FormGroup = this.fb.group({
    id: [0],
    realname: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(7)]],
    role: ['', [Validators.required]],
  });

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UsersService,
    private rolesService: RolesService,
  ) {}

  ngOnInit(): void {
    this.getRoles();
    const userId = this.route.snapshot.paramMap.get('id') || '';
    this.isUpdate = !!userId;
    if (userId) this.getUserInformation(userId);
  }

  private getUserInformation(userId: string) {
    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        this.fillInForm(response);
        this.form.removeControl('password');
      },
      error: (err) => console.log(err),
    });
  }

  private getRoles() {
    this.rolesService.get().subscribe({
      next: (response) => {
        this.roles = response.results;
        this.form.patchValue({ role: this.roles.find((el) => el.name === 'user')?.name });
      },
      error: (err) => console.log(err),
    });
  }

  private fillInForm(user: UserInterface) {
    this.form.patchValue({
      id: user.id,
      realname: user.realname,
      email: user.email,
      role: user.role,
    });
  }

  public save() {
    const roleBody = {
      id: this.form.value.id,
      realname: this.form.value.realname,
      email: this.form.value.email,
      password: this.form.value.password,
      role: this.form.value.role,
    };
    if (!this.isUpdate) {
      delete roleBody.id;
      this.userService.createUser(roleBody).subscribe({
        next: () => this.navigateToUsers(),
        error: (err) => console.log(err),
      });
    } else {
      delete roleBody.password;
      this.userService.updateUserById(roleBody.id, roleBody).subscribe({
        next: () => this.navigateToUsers(),
        error: (err) => console.log(err),
      });
    }
  }

  navigateToUsers() {
    this.router.navigate(['settings/users']);
  }
}
