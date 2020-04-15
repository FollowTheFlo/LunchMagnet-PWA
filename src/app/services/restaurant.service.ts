import { Injectable } from '@angular/core';
import { GraphqlService } from './graphql.service';
import { Restaurant } from './../models/restaurant.model';
import { OpeningSlot } from './../models/openingSlot.model';
import { Subject, Subscription, BehaviorSubject, Observable, of, from, throwError } from 'rxjs';
import { take, map, tap, delay, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class RestaurantService {

    private restaurant: Restaurant = undefined;
    openingSlots: OpeningSlot[] = [];
    weekDays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    constructor(
        public graphqlService: GraphqlService
        ) {}


    // getRestaurant() {
    //     console.log('getRestaurant()', this.restaurant );
    //     if(!this.restaurant || this.restaurant === undefined) {
    //     console.log('return null');
    //     return null;
    //     }

    //     return {...this.restaurant};
        
    // }

    fetchRestaurant() {
        console.log('fetchRestaurant');
        if(this.restaurant) {
            console.log('in condition', this.restaurant);
            return of(this.restaurant);
        }
        return this.graphqlService.getRestaurant('5e9627c5c516c2794b861961')
        .pipe(
            map(response => response.data.getRestaurant),
            map(restaurant =>{ return {...restaurant, mainImageUrl: environment.serverDomain + '/images/' + restaurant.mainImageUrl}}),
            tap(data => {
                this.restaurant = data;
                console.log('in Tap', this.restaurant);
            })
        );
        
    }



    checkIfOpen(targetDate?: Date) {
        //by default use the current time
        targetDate = targetDate === undefined ? new Date() : targetDate;
        console.log('checkIfOpen');
        let isOpened = false;
        //const targetDate = new Date();
        const openingHour = new Date();
        const closingHour = new Date();
        const todayDay = this.weekDays[targetDate.getDay()];
        console.log('todayDay', todayDay);
        const todaySlots = this.restaurant.openingHours.filter(t => t.day === todayDay);
        console.log('todaySlots', todaySlots);
        todaySlots.map( openingSlot =>
    
        
        // const openingSlot: OpeningSlot = this.openingSlots.find(t => {
        //   console.log('t', t);
        //   return t.day === todayDay;
        // } );
        {
          openingHour.setHours(
          +openingSlot.openTime.split(':')[0],
          +openingSlot.openTime.split(':')[1]
        );
    
          closingHour.setHours(
          +openingSlot.closeTime.split(':')[0],
          +openingSlot.closeTime.split(':')[1]
          );
    
          console.log('today', targetDate);
          console.log('openingHour', openingHour);
          console.log('closingHour', closingHour);
    
          if (targetDate >= openingHour && targetDate <= closingHour) {
           console.log('in condition isOpened =  true');
           isOpened = true;
        }
    }
        );
        return isOpened;
      
      }

}