import { Component, OnInit, ViewChild } from '@angular/core';
import { ConfigItem } from './../models/configItem.model';
import { Order } from './../models/order.model';
import { RestaurantService } from './../services/restaurant.service';
import { OrderService } from './../services/order.service';
import { UserService } from './../services/user.service';
import { User } from '../models/user.model';
import { Subject, Subscription, Observable, BehaviorSubject, of, from, throwError, interval } from 'rxjs';
import { map, tap, timeInterval, switchMap } from 'rxjs/operators';
import { IonSlides } from '@ionic/angular';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {
  @ViewChild('stepsSlides', { static: false }) stepsSlides: IonSlides;
  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1.2,
    autoplay: false
  };
  selectedPaymentMethod: ConfigItem;
  paymentMethodList: ConfigItem[] = [];
  collectMethodList: ConfigItem[] = [];
  orders: Order[] = [];
  selectedOrder: Order;
  user: User;
  private intervalSub: Subscription;


  constructor(
    private restaurantService: RestaurantService,
    private orderService: OrderService,
    private userService: UserService
    ) { }

  ngOnInit() {
    console.log('in ngOnInit');

    this.userService.user$.pipe(
      switchMap( user => {
        this.user = user;
        return this.orderService.fetchOrders(this.user._id);
      }),
      map( orders => {
        this.orders = orders;
        return orders;
      })
    )
    .subscribe();

  }

  doRefresh(event) {
    console.log('Begin async operation');

    this.orderService.fetchOrders_afterReset(this.user._id).subscribe( orders => {
      event.target.complete();
      this.orders = orders;
    }    
    
    );
  }

  onClickOrder(order: Order) {
    
    console.log('onClickOrder', order);
    this.selectedOrder = order;
    if (this.stepsSlides) {
      this.stepsSlides.update();
    }
   
  }

  // ionViewDidEnter() {
  //   console.log('ionViewDidEnter');
  //   this.intervalSub = interval(1000)
  //   .subscribe( num => {
  //     console.log('ici 1');
  //     console.log ('ici 2',new Date().getTimezoneOffset()/60);
  //     this.orders.forEach( order => {
  //       order.delay = Math.abs((new Date().getTime() - new Date(order.createdAt).getTime()));
  //       console.log('delay', order.delay);
  //     }
  //   );
  // });
  // }

  // ionViewDidLeave() {
  //   console.log('ionViewDidLeave');
  //   if (this.intervalSub) {
  //     this.intervalSub.unsubscribe();
  //     console.log('this.intervalSub.unsubscribe()');
  //   }
  // }



}
