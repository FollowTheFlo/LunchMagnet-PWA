import { Injectable } from '@angular/core';
import { GraphqlService } from './graphql.service';
import { Order } from 'src/app/models/order.model';
import { Subject, Subscription, BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { map, tap, switchMap, take } from 'rxjs/operators';
import { MenuItem } from '../models/menuItem.model';
import { SelectedItemDB } from '../models/selectedItemDB.model';

@Injectable({ providedIn: 'root' })
export class StepService {

    constructor(
        private graphqlService: GraphqlService
    ){}

    getOneOrder(orderId: string) {
        console.log('getOneOrder');
        return this.graphqlService.getOrder(orderId).pipe(
            map(response => response.data.getOrder)
        );

    }
    
    completeOrderStep(orderId: string, index: number) {
        return this.graphqlService.completeOrderStep(orderId, index)
        .pipe(
            map(response => response.data.completeOrderStep),
            // tap(updatedOrder => {
            //     const oIndex = this.orders.findIndex(order => order._id === updatedOrder._id);
            //     this.orders[oIndex] = updatedOrder;
            //     this._orders.next(JSON.parse(JSON.stringify(this.orders)));
            // })
        );

    }

    cancelOrderStep(orderId: string, index: number) {
        return this.graphqlService.cancelOrderStep(orderId, index)
        .pipe(
            map(response => response.data.cancelOrderStep),
            // tap(cancelOrder => {
            //     const oIndex = this.orders.findIndex(order => order._id === cancelOrder._id);
            //     this.orders[oIndex] = cancelOrder;
            //     this._orders.next(JSON.parse(JSON.stringify(this.orders)));
            // })
        );
    }

}