import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriverDashboardPageRoutingModule } from './driver-dashboard-routing.module';

import { DriverDashboardPage } from './driver-dashboard.page';

import { OrderDetailsPageModule } from './../../shared-components/order-details/order-details.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverDashboardPageRoutingModule,
    OrderDetailsPageModule
  ],
  declarations: [DriverDashboardPage]
})
export class DriverDashboardPageModule {}
