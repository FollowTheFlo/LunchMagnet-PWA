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
const { Geolocation } = Plugins;

@Component({
  selector: 'app-driver-dashboard',
  templateUrl: './driver-dashboard.page.html',
  styleUrls: ['./driver-dashboard.page.scss'],
})
export class DriverDashboardPage implements OnInit, OnDestroy {
  map: L.Map;
  control: L.Routing.Control;
  driverMarker: L.Marker;
  restaurantMarker: L.Marker;
  address: string[];
  orderMarkers: L.Marker[] = [];

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

  selectedDriverPopupOptions: L.PopupOptions = {
    className: 'selectStyle',
    closeButton: false
  };

  driverPopupOptions: L.PopupOptions = {
    closeOnClick: false,
    autoClose: false,
    maxWidth: 300
  };
  houseIcon = L.icon({
    iconUrl: 'assets/markers/home-sharp.png',

    iconSize:     [25, 25], // size of the icon
     popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
});

carSportIcon = L.icon({
  iconUrl: 'assets/markers/car-sport-sharp.png',

  iconSize:     [25, 25], // size of the icon
   popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
});

  restaurantIcon = L.icon({
    iconUrl: 'assets/markers/restaurant-sharp.png',
    iconSize:     [25, 25], // size of the icon
    popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
  });

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

        return this.driverService.fetchDriver(user._id); }
        )
    )
    .subscribe(driver => {
      console.log('ngOnInit driver', driver);
      this.driver = driver;
      this.driverService.getDriverOrders(this.driver._id)
      .subscribe(orders => {
        this.orders = orders;

        if (this.map) {
          // if there are added or removed drivers, add all markers to map again
          // otherwise just update their coordinates
          if (this.orders && this.orders.length > 0) {
            this.fillOrderMarkers();
            this.displayOrdersOnMap();
           } else {
            this.removeMarkers();
          }

        }

      }

        );

    });

    this.restaurantService.fetchRestaurant()
    .subscribe(restaurant => this.restaurant = restaurant);


  }

  ngOnDestroy() {

  }



  ionViewDidEnter() {
    if (!this.mapLoaded) {
      this.loadMap();
      this.mapLoaded = true;
      console.log('before condition');
      if (this.driver && this.driver.locationGeo && this.driver.locationGeo.lat !== 0) {
        console.log('in condition');
        if ( this.driverMarker) {
          this.driverMarker.removeFrom(this.map);
        }
        this.driverMarker = marker([this.driver.locationGeo.lat, this.driver.locationGeo.lng], {
          icon: this.carSportIcon,
          draggable: false
        }).addTo(this.map);
        this.driverMarker.bindPopup('Me', this.driverPopupOptions).openPopup();
      }
      if (this.restaurant) {
        this.drawRestaurantMarker();
      }

      if (this.orders && this.orders.length > 0) {
      this.fillOrderMarkers();
      this.displayOrdersOnMap();
    } else {
      this.removeMarkers();
    }

    }

    console.log('ionViewDidEnter', this.inputAction );
    // display Restaurant location address


  }

  loadMap() {
    this.map = new L.Map('driverMapId').setView([45.508888, -73.561668], 13);
    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.map.on('click', (e: any) => {
      console.log('click event ', e.latlng);
      this.drawMarkerOnMap(e.latlng.lat, e.latlng.lng);
    });
}

   getCurrentPosition() {

      return from(Geolocation.getCurrentPosition());
   }

   drawCurrentPosition() {

    this.getCurrentPosition()
    .subscribe( coordinates => {
        this.drawMarkerOnMap(coordinates.coords.latitude, coordinates.coords.longitude);

    });

  }

  drawMarkerOnMap(lat: number, lng: number) {

    if ( this.driverMarker) {
      this.driverMarker.removeFrom(this.map);
    }

    console.log('drawMarkerOnMap', lat, lng);
    this.driverMarker = marker([lat, lng], {
      icon: this.carSportIcon,
      draggable: true
    }).addTo(this.map);
   // const popup = L.Popup.

    this.driverMarker.bindPopup('Me', this.driverPopupOptions).openPopup();
    this.driver.locationGeo.lat = lat;
    this.driver.locationGeo.lng = lng;
    this.driver.locationTime = new Date().toISOString();

    // if driver Online, get Distance from Mapbox and update to server
    if (this.driver.active) {
      this.geolocationService.getDistance(
        this.driver.locationGeo.lat,
        this.driver.locationGeo.lng,
        this.restaurant.locationGeo.lat,
        this.restaurant.locationGeo.lng
        )
        .subscribe(data => {

          console.log('data', data);
          console.log('distances from Restaurant is', data.distance);
          if (data.success) {
            console.log('mapBoxData Ok');
            this.driver.distanceToRestaurant = data.distance;
            this.driver.timeToRestaurant = data.duration;

            this.driverService.updateDriver(JSON.parse(JSON.stringify(this.driver)))
            .subscribe(driver => {
              console.log('updateDriver', driver);
            },
            error =>  console.log('updateDriver Error', error)
            );

          } else {
            console.log('not able to get Distance/duration from MapBox');

            this.driverService.updateDriver(JSON.parse(JSON.stringify(this.driver)))
            .subscribe(driver => {
              console.log('updateDriver', driver);
            },
            error =>  console.log('updateDriver Error', error)
            );
          }

        },
        error => console.log(error)
        );

    } else {
      console.log('dont update server as offline');
    }
  }


  onToggleChange(event) {
    console.log('onToggleChange()', event);


    console.log('onToggleChange() 1 active: ', this.driver.active);
   // this.driver.status = this.driver.active === false ? 'OFFLINE' : 'WAITING_NEW_ORDER';
   // this.driver.available = this.driverService.setDriverAvailability(this.driver.active, this.driver.status);
   // this.driver.locationTime = new Date().toISOString();
    this.driverService.updateDriver(JSON.parse(JSON.stringify(this.driver)))
        .subscribe(driver => {
          console.log('onToggleChange updateDriver', driver);
          this.driver = driver;
      },
        error =>  console.log('updateDriver Error', error)
      );

}

  onRefresh() {
    console.log('onRefresh');

    this.driverService.getDriverOrders(this.driver._id)
    .subscribe(orders => {
      console.log('driver orders', orders);
      this.orders = orders;
    });
  }

  fillOrderMarkers() {
    console.log('fillDriverMarkers', this.orderMarkers);
    this.removeMarkers();
    this.orders.forEach((order, index) => {
      // Don't create marker for driver that are not ini with lat value 0
      if (order.deliveryLocationGeo.lat !== 0) {
        this.orderMarkers[index] = marker([order.deliveryLocationGeo.lat, order.deliveryLocationGeo.lng], {
          icon: this.houseIcon,
          draggable: false
        });
        this.orderMarkers[index].bindPopup(order.deliveryAddress, this.driverPopupOptions).openPopup();
      }

      // this.newMarker.bindPopup("My location").openPopup();
    });
  }

  removeMarkers() {
    if (this.orderMarkers.length > 0) {
      this.orderMarkers.forEach(orderMarker => {
        orderMarker.removeFrom(this.map);
      });
    }
  }

  displayOrdersOnMap() {

     // display the map to fit all markers, drivers and restaurant
    // @ts-ignore
    this.map.fitBounds( [...this.orders.map(d =>  [d.deliveryLocationGeo.lat, d.deliveryLocationGeo.lng]), [this.restaurant.locationGeo.lat,
     this.restaurant.locationGeo.lng],
    [this.driver.locationGeo.lat, this.driver.locationGeo.lng]
    ]  );
    // .push()
  // .concat(l)
// );
   // .push([this.restaurant.locationGeo.lat, this.restaurant.locationGeo.lng])
   // );
    console.log('displayDriversOnMap', this.orderMarkers);
    this.orderMarkers.forEach(orderMarker => {
      orderMarker.addTo(this.map);
      orderMarker.openPopup();
      orderMarker.on('click', (e: any) => {
       console.log('click event ', e.target._popup._content);

       const selectIndex = this.orders.findIndex(o => o.deliveryAddress === e.target._popup._content);
      //  if (selectIndex !== -1) {
      //   this.onSelectDriver(selectIndex);
      //  }


     });
   });
 }

 updateOrdersMarkers() {

  console.log('updateDriversMarkers', this.orderMarkers);
  this.orderMarkers.forEach((driverMarker, index) => {
    driverMarker.setLatLng([this.orders[index].deliveryLocationGeo.lat, this.orders[index].deliveryLocationGeo.lng]);
  });
}

drawRestaurantMarker() {
  console.log('drawRestaurantMarker');
  if (this.restaurantMarker) {
    this.restaurantMarker.removeFrom(this.map);
  }

  if (this.restaurant) {
    console.log('restaurant', this.restaurant);
    this.restaurantMarker = marker([this.restaurant.locationGeo.lat, this.restaurant.locationGeo.lng], {
      icon: this.restaurantIcon,
      draggable: false
    }).addTo(this.map);
    this.restaurantMarker.bindPopup(this.restaurant.name, this.driverPopupOptions).openPopup();
  }
}



}
