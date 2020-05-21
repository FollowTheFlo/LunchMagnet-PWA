import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService, Feature } from './../../services/geolocation.service';
import { DriverService } from './../../services/driver.service';
import { RestaurantService } from './../../services/restaurant.service';
import { AuthService } from '../../services/auth.service';
import { Map, tileLayer, marker} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Plugins } from '@capacitor/core';
import { of, from } from 'rxjs';
import { Driver } from 'src/app/models/driver.model';
// import { User } from 'src/app/models/user.model';
import { switchMap } from 'rxjs/operators';
import { Restaurant } from 'src/app/models/restaurant.model';
import { Order } from 'src/app/models/order.model';
import { ModalController } from '@ionic/angular';
import { OrderDetailsPage } from 'src/app/shared-components/order-details/order-details.page';

const { Geolocation } = Plugins;

@Component({
  selector: 'app-driver-orders',
  templateUrl: './driver-orders.page.html',
  styleUrls: ['./driver-orders.page.scss'],
})
export class DriverOrdersPage implements OnInit, OnDestroy {
  map: L.Map;
  control: L.Routing.Control;
  driverMarker: L.Marker;
  address: string[];

  addresses: string[] = [];
  selectedAddress = null;
  selectionDone = false;
  features: Feature[] = [];
  customerFeature = undefined;
  mapLoaded = false;
  inputLat = 0;
  inputLng = 0;
  inputAddress = '';
  inputAction = '';
  driver: Driver;
  orders: Order[];

  popupOptions: L.PopupOptions = {
    className: 'floPopup',
    closeButton: false
  };

  popupOptions2: L.PopupOptions = {
    className: 'floPopup2',
    closeButton: true
  };
  restaurant: Restaurant;

  constructor(
    private geolocationService: GeolocationService,
    private driverService: DriverService,
    private authService: AuthService,
    private restaurantService: RestaurantService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {

    this.authService.user$.pipe(
      switchMap(user =>  {
        return this.driverService.fetchDriver(user._id); }
        ),
      switchMap(driver =>  {
        if (!driver) {
          console.log('no driver associated with this user');
          return;
        }
        this.driver = driver;
        return this.driverService.getDriverOrders(this.driver._id);

      }),
      switchMap(orders => this.driverService.orders$)
    )
    .subscribe(orders => this.orders = orders);

    this.restaurantService.fetchRestaurant()
    .subscribe(restaurant => this.restaurant = restaurant);

  }

  ngOnDestroy() {

  }




  onRefresh(event) {
    console.log('onRefresh');

    this.driverService.fetchDriverOrders_afterReset(this.driver._id)
    .subscribe(orders => {
      event.target.complete();
      console.log('fetchDrivers_afterReset orders', orders);
      this.orders = orders;
    });
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
    // modal.style.cssText = '--min-height: 120px; --max-height: 500px;';

    modal.onDidDismiss()
    .then( data => {
      if ( data.data) {
        console.log('dismiss order', data.data);
        const order = data.data;
        this.driverService.updateOrderLocally(order);
    }
    });
    return await modal.present();
  }



}
