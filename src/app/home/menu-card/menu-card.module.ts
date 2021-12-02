import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { FormsModule } from "@angular/forms";
import { MenuCardComponent } from "./menu-card.component";

@NgModule({
  declarations: [MenuCardComponent],
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [MenuCardComponent],
})
export class MenuCardModule {}
