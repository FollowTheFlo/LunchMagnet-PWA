import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DriverOrdersPage } from './driver-orders.page';

const routes: Routes = [
  {
    path: '',
    component: DriverOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DriverOrdersPageRoutingModule {}
