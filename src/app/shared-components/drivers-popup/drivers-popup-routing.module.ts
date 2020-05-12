import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriversPopupPage } from './drivers-popup.page';

const routes: Routes = [
  {
    path: '',
    component: DriversPopupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriversPopupPageRoutingModule {}
