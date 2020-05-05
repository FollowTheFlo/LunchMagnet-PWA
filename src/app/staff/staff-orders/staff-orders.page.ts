import { Component, OnInit } from '@angular/core';
import { OrderService } from './../../services/order.service';
import { Order } from './../../models/order.model';
import { Subject, Subscription, Observable, BehaviorSubject, of, from, throwError, interval } from 'rxjs';
import { map, tap, timeInterval, switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { OrderDetailsPage } from 'src/app/shared-components/order-details/order-details.page';



interface ExtendedOrder extends Order {
  delay: number;
  showDetails: boolean;
}


@Component({
  selector: 'app-staff-orders',
  templateUrl: './staff-orders.page.html',
  styleUrls: ['./staff-orders.page.scss'],
})


export class StaffOrdersPage implements OnInit {

  orders: ExtendedOrder[] = [];
  private intervalSub: Subscription;

  constructor(
    private orderService: OrderService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    console.log('in ngOnInit');

// request list from server then setup the listener.
// listener will be fired when fetching, so update DOM only in listener
    this.orderService.fetchOrders('').pipe(
      switchMap(data =>  this.orderService.orders$)
    )
    .subscribe(orders => {
      console.log('in orders$');
      this.orders = orders as ExtendedOrder[];
      this.orders.forEach(order => {
        order.showDetails = false;
      });
    });


  }

  ionViewDidEnter() {

    console.log('ionViewDidEnter');
    this.intervalSub = interval(10000)
    .subscribe( num => {
      //console.log('ici 1: ', num);
      this.orders.forEach( order => {
        order.delay = Math.abs((new Date().getTime() - new Date(order.createdAt).getTime()));
      }
    );
  });
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave');
    if (this.intervalSub) {
      this.intervalSub.unsubscribe();
      console.log('this.intervalSub.unsubscribe()');
    }
  }

  async onClickOrder(orderId: string) {
    console.log('onClickOrder', orderId);
    console.log('presentModal');
    const modal = await this.modalCtrl.create({
        component: OrderDetailsPage,
        componentProps: {
          orderId
        },

      });
    //modal.style.cssText = '--min-height: 120px; --max-height: 500px;';
 
    // modal.onDidDismiss()
    //   .then((data) => {
    //     console.log(data);
    //     if ( data.data.action === 'save') {
    //       this.userAddress = data.data.address;
    //     }
    //   });
    return await modal.present();
  }


}
