import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthPage } from './auth.page';

const routes: Routes = [
  {
    path: '',
    component: AuthPage,
    children: [
      {
        path: 'login',
        loadChildren: () => import('./login/login.module').then((m) => m.LoginPageModule),
      },
      {
        path: 'signup',
        loadChildren: () => import('./signup/signup.module').then((m) => m.SignupPageModule),
      },
      {
        path: '',
        redirectTo: '/auth/login',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class AuthPageRoutingModule {}
