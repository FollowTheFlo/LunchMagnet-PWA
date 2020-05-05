import { Injectable } from '@angular/core';
import { GraphqlService } from './graphql.service';
import { Order } from 'src/app/models/order.model';
import { Subject, Subscription, BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { MenuItem } from '../models/menuItem.model';
import { SelectedItemDB } from '../models/selectedItemDB.model';

@Injectable({ providedIn: 'root' })
export class OrderService {

    private orders: Order[] = [];
    private _orders = new BehaviorSubject<Order[]>([]);

    private currentOrder: Order;
    private _currentOrder = new BehaviorSubject<Order>(this.currentOrder);

    constructor(
        private graphqlService: GraphqlService
        ) {}

        get orders$() {
            return this._orders.asObservable();
        }

        // set CurrentOrder(order: Order) {
        //     console.log('set CurrentOrder', order);
        //     this.currentOrder = order;
        //     this._currentOrder.next(order);
        // }

        fetchOrders(userId) {
            console.log('fetchOrders(userId)');
            return this.graphqlService.getOrders(userId).pipe(
                map(response => response.data.getOrders),
                tap( orders => {
                    this.orders = orders;
                    this._orders.next([...this.orders]);
                })

            )

        }

        getOneOrder(orderId: string) {
            console.log('getOneOrder');
            return this.graphqlService.getOrder(orderId).pipe(
                map(response => response.data.getOrder)
            );

        }

        createOrder(order: Order) {
            console.log('createOrder', order);
            order.selectedItems = this.buildSelectedItemsDBs(order);
            return this.graphqlService.createOrder(order)
            .pipe(
                 map(response => response.data.createOrder),
                 tap( orderResponse => {
                    this.orders.unshift(orderResponse);
                    console.log('Tap Order', orderResponse);
                    this._orders.next([...this.orders]);
                 })
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
            const dbItems: SelectedItemDB[] = order.selectedMenuItems.map( item => {
                const dbItem: SelectedItemDB = {
                    menuItemId: item._id,
                    name: item.categoryName + ' ' + item.name,
                    name_fr: item.categoryName_fr + ' ' + item.name_fr,
                    price: item.price,
                    totalPrice: item.totalPrice,
                    quantity: item.quantity,
                    optionsText: this.buildItemOptionsText(item),
                    optionsText_fr: this.buildItemOptionsText(item, 'fr'),
                    notes: item.notes
                };
                return dbItem;
                });

            return dbItems;
        }

        buildItemOptionsText(item: MenuItem, local?: string) {
            let optionsText = '';
            let optionsText_fr = '';

            item.options.forEach( option => {
                    option.toppings.forEach(topping => {
                        if (topping.selected) {
                            optionsText += topping.name + ' -> +' + topping.price + '$\n';
                            optionsText_fr += topping.name_fr + ' -> +' + topping.price + '$\n';
                        }
                    });
                });
            if(local === 'fr') {
            return optionsText_fr;
        }
            return optionsText;

        }

        buildTaxesText(item: MenuItem, local?: string) {
            let optionsText = '';
            let optionsText_fr = '';

            if(local === 'fr') {
            return optionsText_fr;
        }
            return optionsText;

        }
}