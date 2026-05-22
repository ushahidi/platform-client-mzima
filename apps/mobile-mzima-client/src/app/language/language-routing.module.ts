import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LanguagePage } from './language.page';

const routes: Routes = [
  {
    path: '',
    component: LanguagePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LanguagePageRoutingModule {}
