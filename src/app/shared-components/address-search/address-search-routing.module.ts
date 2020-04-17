import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddressSearchPage } from './address-search.page';

const routes: Routes = [
  {
    path: '',
    component: AddressSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddressSearchPageRoutingModule {}
