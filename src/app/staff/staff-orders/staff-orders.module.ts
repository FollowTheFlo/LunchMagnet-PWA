import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { StaffOrdersPageRoutingModule } from './staff-orders-routing.module';
import { StaffOrdersPage } from './staff-orders.page';
import { OrderDetailsPageModule } from './../../shared-components/order-details/order-details.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffOrdersPageRoutingModule,
    OrderDetailsPageModule
  ],
  declarations: [StaffOrdersPage]
})
export class StaffOrdersPageModule {}
