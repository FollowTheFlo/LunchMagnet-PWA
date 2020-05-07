import { Component, OnInit, OnDestroy } from '@angular/core';
import { StaffService } from './../../services/staff.service';
import { SocketService } from './../../services/socket.service';
import { Order } from './../../models/order.model';
import { Subject, Subscription, Observable, BehaviorSubject, of, from, throwError, interval } from 'rxjs';
import { map, tap, timeInterval, switchMap, take } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { OrderDetailsPage } from 'src/app/shared-components/order-details/order-details.page';
import { Step } from 'src/app/models/step.model';



interface ExtendedOrder extends Order {
  delay: number;
  showDetails: boolean;
}


@Component({
  selector: 'app-staff-orders',
  templateUrl: './staff-orders.page.html',
  styleUrls: ['./staff-orders.page.scss'],
})


export class StaffOrdersPage implements OnInit, OnDestroy {

  orders: ExtendedOrder[] = [];
  private intervalSub: Subscription;
  private ordersSub: Subscription;
  private socketCreateOrderSub: Subscription;
  private socketUpdatedOrderSub: Subscription;

  constructor(
    private staffService: StaffService,
    private modalCtrl: ModalController,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    console.log('in ngOnInit staff-orders');



// request list from server then setup the listener.
// listener will be fired when fetching, so update DOM only in listener
    this.ordersSub = this.staffService.fetchAllOrders().pipe(
      switchMap(data =>  this.staffService.orders$)
    )
    .subscribe(orders => {
      console.log('in orders$');
      this.orders = orders as ExtendedOrder[];



    });

          // set socket listener on orders updated
    // this.socketUpdatedOrderSub = this.socketService.getMessages('STAFF_ORDER')
    //       .subscribe(socketData => {

    //         console.log('socket', socketData );

    //         if (socketData.action === 'UPDATE') {
    //             this.staffService.updateOrderLocally(socketData.order as Order);
    //         } else
    //         if (socketData.action === 'CREATE') {
    //           this.staffService.addOrderLocally(socketData.order as Order)
    //           .subscribe(result => console.log(result));
    //         }

    //      });
  }

  ngOnDestroy() {
    if (this.ordersSub) {
      this.ordersSub.unsubscribe();
      console.log('this.ordersSub.unsubscribe()');
    }
    // if (this.socketUpdatedOrderSub) {
    //   this.socketUpdatedOrderSub.unsubscribe();
    //   console.log('this.socketUpdatedOrderSub.unsubscribe()');
    // }
    // if (this.socketCreateOrderSub) {
    //   this.socketCreateOrderSub.unsubscribe();
    //   console.log('this.socketCreateOrderSub.unsubscribe()');
    // }
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

    modal.onDidDismiss()
      .then((data) => {
        // this.orderService.fetchOrders('').pipe(
        //   take(1)
        // )
        // .subscribe(orders => {
        //   console.log('dont refresh orders after modal closing');
        //  // this.orders = this.fillExtendedOrders(orders);
        // });
      });
    return await modal.present();
  }

  fillExtendedOrders(orders: Order[]){
    const tempOrders = orders as ExtendedOrder[];
    tempOrders.forEach(order => {
      order.showDetails = false;
      //order.currentStepIndex = order.steps.findIndex(step => step.inProgress === true);
      //order.currentStep = {...order.steps[order.currentStepIndex]};
      if (!order.finished) {
        order.currentStepIndex = order.steps.findIndex(step => step.inProgress === true);
        order.currentStep = {...order.steps[order.currentStepIndex]};
    } else {
      // Order is finsihed, check if completed or canceled
      if (order.status === 'COMPLETED') {
        console.log('order.status -> COMPLETED');
        // if completed, set the last step
        order.currentStepIndex = order.steps.length - 1;
        order.currentStep = {...order.steps[order.currentStepIndex]};
      } else if (order.status === 'CANCELED') {
        console.log('order.status -> CANCELED');
        // if Canceld, set the step that was cancel
        order.currentStepIndex = order.steps.findIndex(step => step.canceled === true);
        console.log('CANCELED currentStepIndex', order);
        order.currentStep = {...order.steps[order.currentStepIndex]};
      } else {
        console.log('expected order status with value COMPLETED or CANCELED');
      }
    }
    });
    return tempOrders;
  }

  doRefresh(event) {
    console.log('Begin async operation');

    //this.orderService.fetchOrders_afterReset();

    this.staffService.fetchOrders_afterReset('').pipe(
      take(1)
    )
    .subscribe(orders => {
      console.log('doRefresh');
      event.target.complete();
      this.orders = this.fillExtendedOrders(orders);
    });

  }


}
