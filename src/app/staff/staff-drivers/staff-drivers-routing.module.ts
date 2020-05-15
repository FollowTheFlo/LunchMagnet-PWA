import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { StaffDriversPage } from './staff-drivers.page';

const routes: Routes = [
  {
    path: '',
    component: StaffDriversPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StaffDriversPageRoutingModule {}
