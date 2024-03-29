import { Injectable } from "@angular/core";
import { GraphqlService } from "./graphql.service";
import { map, tap, switchMap, take } from "rxjs/operators";
import { Driver } from "src/app/models/driver.model";
import { from, BehaviorSubject } from "rxjs";
import Utils from "../utils";

@Injectable({
  providedIn: "root",
})
export class StaffDriversService {
  drivers: Driver[] = [];
  private _drivers = new BehaviorSubject<Driver[]>([]);

  constructor(private graphqlService: GraphqlService) {}

  get drivers$() {
    return this._drivers.asObservable();
  }

  fetchDrivers(filter: string) {
    return this.graphqlService.getDrivers(filter).pipe(
      map((response) => {
        console.log("graphqlService.getDrivers", response.data.getDrivers);
        return response.data.getDrivers;
      }),
      tap((drivers) => {
        this.drivers = Utils.deepCopyDriversList(drivers);
        this._drivers.next(Utils.deepCopyDriversList(this.drivers));
      })
    );
  }

  fetchDrivers_afterReset(filter: string) {
    return from(this.graphqlService.resetStore()).pipe(
      switchMap((res) => this.graphqlService.getDrivers(filter)),
      map((response) => response.data.getDrivers),
      tap((drivers) => {
        this.drivers = drivers;
        this._drivers.next(Utils.deepCopyDriversList(this.drivers));
      }),
      take(1)
    );
  }

  addDriverLocally(driver: Driver) {
    // check if the order is not already in list
    // we do that because race condition with socket ADD ORDER feedback
    console.log("addOrderLocally", driver);
    return from(
      new Promise<string>((resolve, reject) => {
        const index = this.drivers.findIndex((d) => d._id === driver._id);
        if (index === -1) {
          console.log("not in list-> adding locally");
          this.drivers.unshift(driver);
          this._drivers.next(JSON.parse(JSON.stringify(this.drivers)));
          resolve("Driver succesfully Added");
        } else {
          reject("Not added: Order already in List, expected if Staff Role");
        }
      })
    );
  }

  updateDriverLocally(updatedDriver: Driver) {
    const index = this.drivers.findIndex(
      (driver) => driver._id === updatedDriver._id
    );
    if (index !== -1) {
      this.drivers[index] = Utils.deepCopyDriver(updatedDriver);
      this._drivers.next(Utils.deepCopyDriversList(this.drivers));
    } else {
      console.log("the driverId does not exist in local list");
    }
  }
}
