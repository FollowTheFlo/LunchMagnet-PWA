import { Injectable } from '@angular/core';
import { GraphqlService } from './graphql.service';
import { map, tap } from 'rxjs/operators';

import { Driver } from './../models/driver.model';

@Injectable({
    providedIn: 'root'
  })
  export class DriverService {
  
    driver: Driver;
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
}
