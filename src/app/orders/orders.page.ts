import { Component, OnInit } from '@angular/core';
import { ConfigItem } from './../models/configItem.model';
import { Order } from './../models/order.model';
import { RestaurantService } from './../services/restaurant.service';
import { OrderService } from './../services/order.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit {

  selectedPaymentMethod: ConfigItem;
  paymentMethodList: ConfigItem[] = [];
  collectMethodList: ConfigItem[] = [];
  orders: Order[] = [];


  constructor(
    private restaurantService: RestaurantService,
    private orderService: OrderService
    ) { }

  ngOnInit() {
    console.log('in ngOnInit');
    this.orderService.fetchOrders('5e8f3fd01986990acb872db9')
    .subscribe(orders => {
      console.log('in fetchOrders');
      this.orders = orders;
    });
    

    // this.orderService.orders$
    //   .subscribe( orders => {
    //     console.log('in Sub orders$');
    //     this.orders = orders;
    //   });
  

  }

}
