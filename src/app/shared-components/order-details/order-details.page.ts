import { Component, OnInit, ViewChild } from '@angular/core';
import { NavParams, ModalController, ToastController, IonSlides } from '@ionic/angular';
import { OrderService } from './../../services/order.service';
import { SocketService } from './../../services/socket.service';
import { Order } from 'src/app/models/order.model';
import { Step } from 'src/app/models/step.model';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnInit {
  @ViewChild('stepsSlides', { static: false }) stepsSlides: IonSlides;
  orderId = '';
  showSlides = false;
  order: Order;
  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1.2,
    autoplay: false
  };

  constructor(
    private orderService: OrderService,
    private socketService: SocketService,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    public toastCtrl: ToastController
  ) {

    this.orderId = navParams.get('orderId');
  }

  ngOnInit() {

    console.log('ngOnInit', this.orderId);
    if (this.orderId) {
      this.orderService.getOneOrder(this.orderId)
      .subscribe(order => {
        this.order = order;
      });
    }
  }

  ionViewWillEnter() {
    this.showSlides = true;
  }

  ionViewDidEnter() {
    this.stepsSlides.slideTo(this.order.currentStepIndex, 500);
  }

  onCompleteStep(step: Step, index: number) {
    console.log('onCompleteStep step', step);
    console.log('onCompleteStep index', index);
 
    this.orderService.completeOrderStep(this.order._id, index)
    .subscribe(order => {
      console.log('completeOrderStep Response');
      this.order = order;
      this.stepsSlides.slideTo(this.order.currentStepIndex, 500);
      
 
    });
  }

  onCancelStep(step: Step, index: number) {
    console.log('onCancelStep step', step);
    console.log('onCancelStep index', index);
    this.orderService.cancelOrderStep(this.order._id, index)
    .subscribe(order => {
      this.order = order;
    });
  }

  async closeModal() {
    console.log('closeModal');
    //await this.toastCtrl.dismiss();
    const modal = await this.modalCtrl.getTop();
    modal.dismiss();
  }



}
