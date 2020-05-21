import { Component, OnInit, ViewChild } from '@angular/core';
import { NavParams, ModalController, ToastController, IonSlides } from '@ionic/angular';
import { StepService } from './../../services/step.service';
import { SocketService } from './../../services/socket.service';
import { AuthService } from './../../services/auth.service';
import { Order } from 'src/app/models/order.model';
import { Step } from 'src/app/models/step.model';
import { User } from 'src/app/models/user.model';
import { DriversPopupPage } from '../drivers-popup/drivers-popup.page';

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
  user: User;
  slideOpts = {
    initialSlide: 0,
    slidesPerView: 1.2,
    autoplay: false
  };
  isModified = false;

  constructor(
    private stepService: StepService,
    private socketService: SocketService,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    public toastCtrl: ToastController,
    private authService: AuthService
  ) {

    this.orderId = navParams.get('orderId');
    this.user = navParams.get('user');
  }

  ngOnInit() {

    console.log('ngOnInit', this.orderId);
    if (this.orderId) {
      this.stepService.getOneOrder(this.orderId)
      .subscribe(order => {
        this.order = order;
        this.user = this.authService.currentUser;
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
 
    this.stepService.completeOrderStep(this.order._id, index)
    .subscribe(order => {
      console.log('completeOrderStep Response');
      this.order = order;
      this.stepsSlides.slideTo(this.order.currentStepIndex, 500);
      this.isModified = true;
      
 
    });
  }

  onCancelStep(step: Step, index: number) {
    console.log('onCancelStep step', step);
    console.log('onCancelStep index', index);
    this.stepService.cancelOrderStep(this.order._id, index)
    .subscribe(order => {
      this.order = order;
      this.stepsSlides.slideTo(this.order.currentStepIndex, 500);
      this.isModified = true;
    });
  }

  async closeModal() {
    console.log('closeModal');
    //await this.toastCtrl.dismiss();
    const modal = await this.modalCtrl.getTop();
    if(this.isModified) {
      modal.dismiss(this.order);
    } else{
      modal.dismiss(null);
    }
   
  }

  async onClickDrivers(order: Order) {
    console.log('onClickDriver order', order);
    console.log('presentModal');
    const modal = await this.modalCtrl.create({
        component: DriversPopupPage,
        componentProps: {
          order
        },

      });

    modal.onDidDismiss()
      .then((data) => {
        if(data){
          console.log('dismiss order', data['data']);
          this.order = data['data'];
          this.stepsSlides.slideTo(this.order.currentStepIndex, 500);
      }
      });
    return await modal.present();
  }




}
