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
//import { User } from 'src/app/models/user.model';
import { switchMap } from 'rxjs/operators';
import { Restaurant } from 'src/app/models/restaurant.model';
import { Order } from 'src/app/models/order.model';
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
    private restaurantService: RestaurantService
  ) { }

  ngOnInit() {

    this.authService.user$.pipe(
      switchMap(user =>  {

        return this.driverService.fetchDriver(user._id)}
        )
    )
    .subscribe(driver => {
      console.log('ngOnInit driver', driver);
      this.driver = driver;
      this.driverService.getDriverOrders(this.driver._id)
      .subscribe(orders => this.orders = orders);

    });

    this.restaurantService.fetchRestaurant()
    .subscribe(restaurant => this.restaurant = restaurant);

    


    // this.driverService.fetchDriver('5e8f3fd01986990acb872db9')
    // .subscribe(driver => {
    //   console.log('driver', driver);
    //   this.driver = driver;
    // });
  }

  ngOnDestroy() {

  }




  onRefresh() {
    console.log('onRefresh');

    this.driverService.getDriverOrders(this.driver._id)
    .subscribe(orders => {
      console.log('driver orders', orders);
      this.orders = orders;
    });
  }



}
