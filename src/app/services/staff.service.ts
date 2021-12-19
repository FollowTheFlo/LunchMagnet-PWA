import { Injectable } from "@angular/core";
import { GraphqlService } from "./graphql.service";
import { Order } from "src/app/models/order.model";
import {
  Subject,
  Subscription,
  BehaviorSubject,
  Observable,
  of,
  from,
  throwError,
} from "rxjs";
import { map, tap, switchMap, take } from "rxjs/operators";
import { MenuItem } from "../models/menuItem.model";
import { SelectedItemDB } from "../models/selectedItemDB.model";
import Utils from "../utils";

@Injectable({ providedIn: "root" })
export class StaffService {
  private orders: Order[] = [];
  private _orders = new BehaviorSubject<Order[]>([]);

  constructor(private graphqlService: GraphqlService) {}

  get orders$() {
    return this._orders.asObservable();
  }

  fetchAllOrders() {
    console.log("fetchOrders()");
    return this.graphqlService.getOrders("").pipe(
      map((response) => response.data.getOrders),
      tap((orders) => {
        this.orders = orders;
        this._orders.next(JSON.parse(JSON.stringify(this.orders)));
      })
    );
  }

  fetchOrders_afterReset(userId) {
    // reset the graphql cache to force the request to server
    console.log("fetchOrders_afterReset()");
    return from(this.graphqlService.resetStore()).pipe(
      switchMap((res) => {
        console.log("Apollo Store Cache reset:", res);
        return this.graphqlService.getOrders(userId);
      }),
      map((response) => response.data.getOrders),
      tap((orders) => {
        this.orders = orders;
        this._orders.next(JSON.parse(JSON.stringify(this.orders)));
      }),
      take(1)
    );

    // return this.graphqlService.getOrders(userId).pipe(
    //         map(response => response.data.getOrders),
    //         tap( orders => {
    //             this.orders = orders;
    //             this._orders.next([...this.orders]);
    //         })

    //     );
  }

  getOneOrder(orderId: string) {
    console.log("getOneOrder");
    return this.graphqlService
      .getOrder(orderId)
      .pipe(map((response) => response.data.getOrder));
  }

  createOrder(order: Order) {
    console.log("createOrder", order);
    order.selectedItems = this.buildSelectedItemsDBs(order);
    return this.graphqlService.createOrder(order).pipe(
      map((response) => response.data.createOrder),
      switchMap((orderResponse) => {
        return this.addOrderLocally(orderResponse);
      })
    );
  }

  addOrderLocally(order: Order) {
    // check if the order is not already in list
    // we do that because race condition with socket ADD ORDER feedback
    console.log("addOrderLocally", order);
    return from(
      new Promise<string>((resolve, reject) => {
        const index = this.orders.findIndex((o) => o._id === order._id);
        if (index === -1) {
          console.log("not in list-> adding locally");
          this.orders.unshift(order);
          this._orders.next(Utils.deepCopyOrdersList(this.orders));
          resolve("Order succesfully Added");
        } else {
          reject("Not added: Order already in List, expected if Staff Role");
        }
      })
    );
  }

  updateOrderLocally(updatedOrder: Order) {
    const index = this.orders.findIndex(
      (order) => order._id === updatedOrder._id
    );
    if (index !== -1) {
      this.orders[index] = updatedOrder;
      this._orders.next(JSON.parse(JSON.stringify(this.orders)));
    } else {
      console.log("the orderId does not exist in local list");
    }
  }

  completeOrderStep(orderId: string, index: number) {
    return this.graphqlService.completeOrderStep(orderId, index).pipe(
      map((response) => response.data.completeOrderStep)
      // tap(updatedOrder => {
      //     const oIndex = this.orders.findIndex(order => order._id === updatedOrder._id);
      //     this.orders[oIndex] = updatedOrder;
      //     this._orders.next(JSON.parse(JSON.stringify(this.orders)));
      // })
    );
  }

  cancelOrderStep(orderId: string, index: number) {
    return this.graphqlService.cancelOrderStep(orderId, index).pipe(
      map((response) => response.data.cancelOrderStep)
      // tap(cancelOrder => {
      //     const oIndex = this.orders.findIndex(order => order._id === cancelOrder._id);
      //     this.orders[oIndex] = cancelOrder;
      //     this._orders.next(JSON.parse(JSON.stringify(this.orders)));
      // })
    );
  }

  // saveOrder(
  // ) {
  //     this.currentOrder.selectedItemDBs = this.buildSelectedItemsDBs();
  //     console.log('selectedItemDBs', this.currentOrder.selectedItemDBs);
  //     const itemList = JSON.stringify(this.currentOrder.selectedMenuItems);
  //     let itemListFormated = itemList.replace(/"([^"]+)":/g,"$1:");
  //     itemListFormated = itemListFormated.replace(/"/g,"|");
  //     this.currentOrder.selectedMenuItemsString = itemListFormated;
  //     console.log('saveOrder');
  //     return this.graphqlService.createOrder(this.currentOrder)
  //     .pipe(
  //          map(response => response.data.createOrder)
  //     );
  // }

  buildSelectedItemsDBs(order: Order) {
    const dbItems: SelectedItemDB[] = order.selectedMenuItems.map((item) => {
      const dbItem: SelectedItemDB = {
        menuItemId: item._id,
        name: item.categoryName + " " + item.name,
        name_fr: item.categoryName_fr + " " + item.name_fr,
        price: item.price,
        totalPrice: item.totalPrice,
        quantity: item.quantity,
        optionsText: this.buildItemOptionsText(item),
        optionsText_fr: this.buildItemOptionsText(item, "fr"),
        notes: item.notes,
      };
      return dbItem;
    });

    return dbItems;
  }

  buildItemOptionsText(item: MenuItem, local?: string) {
    let optionsText = "";
    let optionsText_fr = "";

    item.options.forEach((option) => {
      option.toppings.forEach((topping) => {
        if (topping.selected) {
          optionsText += topping.name + " -> +" + topping.price + "$\n";
          optionsText_fr += topping.name_fr + " -> +" + topping.price + "$\n";
        }
      });
    });
    if (local === "fr") {
      return optionsText_fr;
    }
    return optionsText;
  }

  buildTaxesText(item: MenuItem, local?: string) {
    let optionsText = "";
    let optionsText_fr = "";

    if (local === "fr") {
      return optionsText_fr;
    }
    return optionsText;
  }
}
