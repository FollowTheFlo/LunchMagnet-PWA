import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Restaurant } from "src/app/models/restaurant.model";
import { User } from "src/app/models/user.model";

@Component({
  selector: "app-top-segment",
  templateUrl: "./top-segment.component.html",
  styleUrls: ["./top-segment.component.scss"],
})
export class TopSegmentComponent implements OnInit {
  @Input() user: User;
  @Input() restaurant: Restaurant;
  @Output() onChangeCollectingMethod = new EventEmitter<any>();
  @Output() onOpenSearchAddress = new EventEmitter();
  @Output() onOpenMapHandler = new EventEmitter();
  constructor() {}

  ngOnInit() {}

  onChangeSegment(ev) {
    this.onChangeCollectingMethod.next(ev);
  }
  onSearchAddress() {
    this.onOpenSearchAddress.next();
  }

  onOpenMap() {
    this.onOpenMapHandler.next();
  }
}
