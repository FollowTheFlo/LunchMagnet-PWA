import { Injectable } from "@angular/core";
import { GraphqlService } from "./graphql.service";
import { Restaurant } from "./../models/restaurant.model";
import { ConfigItem } from "./../models/configItem.model";
import { OpeningSlot } from "./../models/openingSlot.model";
import {
  Subject,
  Subscription,
  BehaviorSubject,
  Observable,
  of,
  from,
  throwError,
} from "rxjs";
import { take, map, tap, delay, switchMap, catchError } from "rxjs/operators";
import { environment } from "../../environments/environment";

export interface CurrentSlot {
  isOpen: boolean;
  openHour: Date;
  closeHour: Date;
}

@Injectable({ providedIn: "root" })
export class RestaurantService {
  private restaurant: Restaurant = undefined;
  openingSlots: OpeningSlot[] = [];
  weekDays: string[] = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  constructor(public graphqlService: GraphqlService) {}

  // getRestaurant() {
  //     console.log('getRestaurant()', this.restaurant );
  //     if(!this.restaurant || this.restaurant === undefined) {
  //     console.log('return null');
  //     return null;
  //     }

  //     return {...this.restaurant};

  // }

  fetchRestaurant() {
    console.log("fetchRestaurant");
    if (this.restaurant) {
      console.log("in condition", this.restaurant);
      return of(this.restaurant);
    }
    return this.graphqlService.getRestaurant("5e9627c5c516c2794b861961").pipe(
      map((response) => response.data.getRestaurant),
      map((restaurant) => {
        return {
          ...restaurant,
          mainImageUrl:
            environment.IMAGE_SERVER_DOMAIN +
            "/images/" +
            restaurant.mainImageUrl,
        } as Restaurant;
      }),
      tap((data) => {
        this.restaurant = data as Restaurant;
        console.log("in Tap", this.restaurant);
      })
    );
  }

  checkIfOpen(targetDate?: Date): CurrentSlot {
    // by default use the current time
    targetDate = targetDate === undefined ? new Date() : targetDate;
    console.log("checkIfOpen");
    let isOpened = false;
    //const targetDate = new Date();
    const openingHour = new Date();
    const closingHour = new Date();
    const todayDay = this.weekDays[targetDate.getDay()];
    console.log("todayDay", todayDay);
    const todaySlots = this.restaurant.openingHours.filter(
      (t) => t.day === todayDay
    );
    console.log("todaySlots", todaySlots);
    todaySlots.map((openingSlot) =>
      // const openingSlot: OpeningSlot = this.openingSlots.find(t => {
      //   console.log('t', t);
      //   return t.day === todayDay;
      // } );
      {
        openingHour.setHours(
          +openingSlot.openTime.split(":")[0],
          +openingSlot.openTime.split(":")[1]
        );

        closingHour.setHours(
          +openingSlot.closeTime.split(":")[0],
          +openingSlot.closeTime.split(":")[1]
        );

        console.log("today", targetDate);
        console.log("openingHour", openingHour);
        console.log("closingHour", closingHour);

        if (targetDate >= openingHour && targetDate <= closingHour) {
          console.log("in condition isOpened =  true");
          isOpened = true;
        }
      }
    );
    const currentSlot = {
      isOpen: isOpened,
      openHour: openingHour,
      closeHour: closingHour,
    };
    return currentSlot;
  }

  getTipsList(): Observable<ConfigItem[]> {
    return this.getConfigItems("TIPS", "index");
    //   .pipe(
    //       // set the field1 to false as we will use it as Selected boolean
    //       map( tips => tips.map(t => {
    //           t.field1 = 'false';
    //           return t;
    //         }))
    //   );
  }

  getTaxList(): Observable<ConfigItem[]> {
    return this.getConfigItems("TAX", "index");
  }

  getCollectMethodsList(): Observable<ConfigItem[]> {
    return this.getConfigItems("COLLECT_METHOD", "index");
  }

  getPaymentMethodsList(): Observable<ConfigItem[]> {
    return this.getConfigItems("PAYMENT_METHOD", "index");
  }

  getConfigItems(name: string, sortMethod: string): Observable<ConfigItem[]> {
    return this.graphqlService.getConfigItems(name, sortMethod).pipe(
      take(1),
      map((response) => response.data.getConfigItems)
    );
  }
}
