import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SelectLanguagePage } from './select-language.page';

export const routes: Routes = [
  {
    path: '',
    component: SelectLanguagePage,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectLanguagePageRoutingModule {}
