import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ExtendedOrder, Order } from "src/app/models/order.model";

@Component({
  selector: "app-staff-order-card",
  templateUrl: "./staff-order-card.component.html",
  styleUrls: ["./staff-order-card.component.scss"],
})
export class StaffOrderCardComponent implements OnInit {
  @Input() order: ExtendedOrder;
  @Output() onClickOrderHandle = new EventEmitter<string>();
  @Output() onClickDriversHandle = new EventEmitter<Order>();
  constructor() {}

  ngOnInit() {}

  onClickOrder(orderId: string) {
    this.onClickOrderHandle.next(orderId);
  }

  onClickDrivers(order: Order) {
    this.onClickDriversHandle.next(order);
  }
}
