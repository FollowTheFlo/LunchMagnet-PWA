import { Injectable } from "@angular/core";
import { GraphqlService } from "./graphql.service";
import { map, tap, switchMap, take } from "rxjs/operators";

import { Driver } from "./../models/driver.model";
import { Order } from "../models/order.model";
import { BehaviorSubject, from } from "rxjs";
import Utils from "../utils";

@Injectable({
  providedIn: "root",
})
export class DriverService {
  driver: Driver;
  orders: Order[] = [];
  private _orders = new BehaviorSubject<Order[]>([]);

  constructor(private graphqlService: GraphqlService) {}

  get orders$() {
    return this._orders.asObservable();
  }

  fetchDriver(userId: string) {
    return this.graphqlService.getDriver(userId).pipe(
      map((response) => response.data.getDriver as Driver),
      tap((driver) => (this.driver = driver))
    );
  }

  updateDriver(driver: Driver) {
    return this.graphqlService.updateDriver(Utils.deepCopyDriver(driver)).pipe(
      map((response) => response.data.updateDriver),
      tap(
        (driverResponse) => (this.driver = Utils.deepCopyDriver(driverResponse))
      )
    );
  }

  setDriverAvailability(active: boolean, status: string) {
    if (active && status === "ON_WAY_TO_RESTAURANT") {
      return true;
    } else if (active && status === "ON_WAY_TO_CUSTOMER") {
      return false;
    } else if (active && status === "WAITING_NEW_ORDER") {
      return true;
    } else if (!active && status === "OFFLINE") {
      return false;
    } else {
      return false;
    }
  }

  getDriverOrders(driverId: string) {
    return this.graphqlService.getDriverOrders(driverId).pipe(
      map((response) => response.data.getDriverOrders),
      tap((orders) => {
        this.orders = Utils.deepCopyOrdersList(orders);
        this._orders.next(Utils.deepCopyOrdersList(this.orders));
      })
    );
  }

  fetchDriverOrders_afterReset(driverId: string) {
    return from(this.graphqlService.resetStore()).pipe(
      switchMap((res) => this.graphqlService.getDriverOrders(driverId)),
      map((response) => response.data.getDriverOrders),
      tap((orders) => {
        this.orders = Utils.deepCopyOrdersList(orders);
        this._orders.next(Utils.deepCopyOrdersList(this.orders));
      }),
      take(1)
    );
  }

  addOrderLocally(order: Order) {
    // check if the order is not already in list
    // we do that because race condition with socket ADD ORDER feedback
    console.log("addOrderLocally", order);
    const index = this.orders.findIndex((o) => o._id === order._id);
    if (index === -1) {
      console.log("not in list-> adding locally");
      this.orders.unshift(Utils.deepCopyOrder(order));
      this._orders.next(Utils.deepCopyOrdersList(this.orders));
    }
  }

  updateOrderLocally(updatedOrder: Order) {
    const index = this.orders.findIndex(
      (order) => order._id === updatedOrder._id
    );
    if (index !== -1) {
      this.orders[index] = Utils.deepCopyOrder(updatedOrder);
      this._orders.next(Utils.deepCopyOrdersList(this.orders));
    } else {
      console.log("the orderId does not exist in local list");
    }
  }

  removeOrderLocally(updatedOrder: Order) {
    console.log("removeOrderLocally");
    const index = this.orders.findIndex(
      (order) => order._id === updatedOrder._id
    );
    if (index !== -1) {
      this.orders.splice(index);
      this._orders.next(Utils.deepCopyOrdersList(this.orders));
    } else {
      console.log("the orderId does not exist in local list");
    }
  }
}
