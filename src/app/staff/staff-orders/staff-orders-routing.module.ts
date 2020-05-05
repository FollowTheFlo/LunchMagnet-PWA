import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffOrdersPage } from './staff-orders.page';

const routes: Routes = [
  {
    path: '',
    component: StaffOrdersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffOrdersPageRoutingModule {}
