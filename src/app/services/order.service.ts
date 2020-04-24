import { Injectable } from '@angular/core';
import { GraphqlService } from './graphql.service';
import { Order } from 'src/app/models/order.model';
import { Subject, Subscription, BehaviorSubject, Observable, of, from, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrderService {

    private orders: Order[] = [];
    private _orders = new BehaviorSubject<Order[]>([]);

    private currentOrder: Order;
    private _currentOrder = new BehaviorSubject<Order>(this.currentOrder);

    constructor(
        private graphqlService: GraphqlService
        ) {}

        get currentOrder$() {
            return this._currentOrder.asObservable();
        }

        set CurrentOrder(order: Order) {
            console.log('set CurrentOrder', order);
            this.currentOrder = order;
            this._currentOrder.next(order);
        }
}