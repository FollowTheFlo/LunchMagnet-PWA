import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { StaffOrdersPageRoutingModule } from "./staff-orders-routing.module";
import { StaffOrdersPage } from "./staff-orders.page";
import { OrderDetailsPageModule } from "./../../shared-components/order-details/order-details.module";
import { DriversPopupPageModule } from "./../../shared-components/drivers-popup/drivers-popup.module";
import { StaffOrderCardModule } from "./staff-order-card/staff-order-card.module";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffOrdersPageRoutingModule,
    OrderDetailsPageModule,
    DriversPopupPageModule,
    StaffOrderCardModule,
  ],
  declarations: [StaffOrdersPage],
})
export class StaffOrdersPageModule {}
