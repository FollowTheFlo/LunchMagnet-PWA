import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, ToastController } from '@ionic/angular';
import { OrderService } from './../../services/order.service';
import { Order } from 'src/app/models/order.model';
import { Step } from 'src/app/models/step.model';

@Component({
  selector: 'app-order-details',
  templateUrl: './order-details.page.html',
  styleUrls: ['./order-details.page.scss'],
})
export class OrderDetailsPage implements OnInit {
  orderId = '';
  order: Order;
  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1,
    autoplay: false
  };
  currentStep: Step;
  currentIndex = 0;

  constructor(
    private orderService: OrderService,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    public toastCtrl: ToastController
  ) {

    this.orderId = navParams.get('orderId');
  }

  ngOnInit() {
    console.log('ngOnInit',this.orderId);
    if (this.orderId) {
      this.orderService.getOneOrder(this.orderId)
      .subscribe(order => {
        this.order = order;
        this.currentStep = order.steps.find(step => step.inProgress === true);
        this.currentIndex = order.steps.findIndex(step => step.inProgress === true);
      });
    }
  }

  async closeModal() {
    console.log('closeModal');
    //await this.toastCtrl.dismiss();
    const modal = await this.modalCtrl.getTop();
    modal.dismiss();
  }

  

}
