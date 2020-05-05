import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DriverOrdersPageRoutingModule } from './driver-orders-routing.module';

import { DriverOrdersPage } from './driver-orders.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DriverOrdersPageRoutingModule
  ],
  declarations: [DriverOrdersPage]
})
export class DriverOrdersPageModule {}
