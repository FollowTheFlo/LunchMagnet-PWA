import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { StaffOrderCardComponent } from "./staff-order-card.component";

@NgModule({
  declarations: [StaffOrderCardComponent],
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [StaffOrderCardComponent],
})
export class StaffOrderCardModule {}
