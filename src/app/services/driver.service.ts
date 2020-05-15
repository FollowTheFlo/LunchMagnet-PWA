import { Injectable } from '@angular/core';
import { GraphqlService } from './graphql.service';
import { map, tap } from 'rxjs/operators';

import { Driver } from './../models/driver.model';
import { Order } from '../models/order.model';

@Injectable({
    providedIn: 'root'
  })
  export class DriverService {
  
    driver: Driver;
    orders: Order[] = [];

    constructor(
        private graphqlService: GraphqlService
    ) {}

    fetchDriver(userId: string) {
        return this.graphqlService.getDriver(userId).pipe(
            map(response => response.data.getDriver),
            tap(driver => this.driver = driver)
        );
    }


    updateDriver(driver: Driver) {
        return this.graphqlService.updateDriver(driver).pipe(
            map(response => response.data.updateDriver),
            tap(driverResponse => this.driver = driverResponse)
        );
    }

    setDriverAvailability(active: boolean, status: string) {
        if (active && status === 'ON_WAY_TO_RESTAURANT') {
            return true;
        } else if (active && status === 'ON_WAY_TO_CUSTOMER') {
            return false;
        } else if (active && status === 'WAITING_NEW_ORDER') {
            return true;
        } else if (!active && status === 'OFFLINE') {
            return false;
        } else {
            return false;
        }
    }

    getDriverOrders(driverId: string) {
        return this.graphqlService.getDriverOrders(driverId)
        .pipe(
            map(response => response.data.getDriverOrders),
            tap(orders => this.orders = orders)
        );
    }
}
