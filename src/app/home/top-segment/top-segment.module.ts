import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { IonicModule } from "@ionic/angular";
import { TopSegmentComponent } from "./top-segment.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [TopSegmentComponent],
  imports: [CommonModule, IonicModule, FormsModule],
  exports: [TopSegmentComponent],
})
export class TopSegmentModule {}
