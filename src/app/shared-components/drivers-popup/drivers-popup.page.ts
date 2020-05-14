import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService, Feature } from './../../services/geolocation.service';
import { StaffDriversService} from './../../services/staff-drivers.service';
import { SocketService} from './../../services/socket.service';
import { RestaurantService} from './../../services/restaurant.service';
import { Map, tileLayer, marker} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalController, NavParams } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Driver } from 'src/app/models/driver.model';
import { Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { Restaurant } from 'src/app/models/restaurant.model';

interface ExtendedDriver extends Driver {
  isSelected: boolean;
  delay: string;
}

@Component({
  selector: 'app-drivers-popup',
  templateUrl: './drivers-popup.page.html',
  styleUrls: ['./drivers-popup.page.scss'],
})



export class DriversPopupPage implements OnInit, OnDestroy {
  drivers: ExtendedDriver[] = [];
  restaurant: Restaurant;
  restaurantMarker: L.Marker;
  map: L.Map;
  // control: L.Routing.Control;

  driverMarkers: L.Marker[] = [];

  features: Feature[] = [];
  customerFeature = undefined;
  mapLoaded = false;
  socketSub: Subscription;
  driversSub: Subscription;
  selectedDriverIndex = -1;

  selectedDriverPopupOptions: L.PopupOptions = {
    className: 'selectStyle',
    closeButton: false
  };

  driverPopupOptions: L.PopupOptions = {
    closeOnClick: false,
    autoClose: false
  };

  carIcon = L.icon({
    iconUrl: 'assets/markers/car-sharp.png',

    iconSize:     [25, 25], // size of the icon
    // shadowSize:   [50, 64], // size of the shadow
    // iconAnchor:   [22, 94], // point of the icon which will correspond to marker's location
    // shadowAnchor: [4, 62],  // the same for the shadow
     popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
});

  restaurantIcon = L.icon({
    iconUrl: 'assets/markers/restaurant-sharp.png',
    iconSize:     [25, 25], // size of the icon
    popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
  });



  constructor(
    private staffDriversService: StaffDriversService,
    private modalCtrl: ModalController,
    private socketService: SocketService,
    private restaurantService: RestaurantService
  ) { }

  ngOnInit() {

    this.restaurantService.fetchRestaurant()
    .subscribe(restaurant => {
      this.restaurant = restaurant;
    });

    this.driversSub = this.staffDriversService.fetchDrivers('ALL')
    .pipe(
      switchMap(drivers => this.staffDriversService.drivers$)
    )
    .subscribe( drivers => {
      console.log('drivers ', drivers);

      const driversCount = this.drivers.length;
      this.drivers = drivers as ExtendedDriver[];

      this.drivers = this.calculateDelay(new Date(), [...this.drivers]);
      // file the isSelected property to false as initial state, no driver selected
      // if one was previously selected, set true at slected Index
      this.drivers.forEach((driver, index) => {
        if ( index === this.selectedDriverIndex ) {
          driver.isSelected = true;
        } else {
          driver.isSelected = false;
        }
      });

      const countChanged = driversCount !== this.drivers.length ? true : false;
      console.log('countChanged', countChanged);
      // this.drivers = drivers.filter(driver => driver.locationGeo.lat !== 0 );


      if (this.map) {
        // if there are added or removed drivers, add all markers to map again
        // otherwise just update their coordinates
        if (countChanged) {
          this.fillDriverMarkers();
          this.displayDriversOnMap();
        } else {
          this.updateDriversMarkers();
        }
        // this.map.fitBounds(this.drivers.map(d => [d.locationGeo.lat, d.locationGeo.lng]));
      }
  });

    this.socketSub = this.socketService.getMessages('STAFF_DRIVERS')
  .subscribe(socketData => {

    console.log('socket', socketData );

    if (socketData.action === 'UPDATE') {
        // this.staffService.updateOrderLocally(socketData.order as Order);
        this.staffDriversService.updateDriverLocally((socketData.driver as Driver));
    } else
    if (socketData.action === 'CREATE') {
     // this.staffService.addOrderLocally(socketData.order as Order)
     // .subscribe(result => console.log(result));
     this.staffDriversService.addDriverLocally((socketData.driver as Driver));
    }

 });
  }

  ngOnDestroy() {
    this.removeMarkers();
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
    if (this.driversSub) {
      this.driversSub.unsubscribe();
    }
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave');
    this.removeMarkers();
    // if (this.driverMarkers.length > 0) {
    //   this.driverMarkers.forEach(driverMarker => {
    //     driverMarker.removeFrom(this.map);
    //   });
    // }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    if (!this.mapLoaded) {
      this.loadMap();
      this.mapLoaded = true;
    }


    // display Restaurant location address


  }

  loadMap() {
    console.log('loadMap');
    this.map = new L.Map('driversMapId').setView([45.508888, -73.561668], 13);
    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.drawRestaurantMarker();
    this.fillDriverMarkers();
    this.displayDriversOnMap();

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
      this.restaurantMarker.bindPopup(this.restaurant.name, this.driverPopupOptions);
    }
  }

  fillDriverMarkers() {
    console.log('fillDriverMarkers', this.driverMarkers);
    this.removeMarkers();
    this.drivers.forEach((driver, index) => {
      // Don't create marker for driver that are not ini with lat value 0
      if (driver.locationGeo.lat !== 0) {
        this.driverMarkers[index] = marker([driver.locationGeo.lat, driver.locationGeo.lng], {
          icon: this.carIcon,
          draggable: false
        });
        this.driverMarkers[index].bindPopup(driver.user.name, this.driverPopupOptions);
      }

      // this.newMarker.bindPopup("My location").openPopup();
    });
  }

  displayDriversOnMap() {

     // let r : L.LatLngBoundsExpression ;//= [this.restaurant.locationGeo.lat, this.restaurant.locationGeo.lng];
     const l = new L.LatLng(this.restaurant.locationGeo.lat, this.restaurant.locationGeo.lng);

     let yo: L.LatLng[];

    // yo = this.drivers.map(d =>  { lat: d.locationGeo.lat, lng:d.locationGeo.lng} );
     // yo.push([1, 2]);
     const test =  [...this.drivers.map(d =>  [d.locationGeo.lat, d.locationGeo.lng]), [this.restaurant.locationGeo.lat,
   this.restaurant.locationGeo.lng] ];
     console.log('test1', test);

     const test1 =  this.drivers.map(d =>  [d.locationGeo.lat, d.locationGeo.lng]);
     console.log('test2', test1);

     // display the map to fit all markers, drivers and restaurant
     // @ts-ignore
     this.map.fitBounds( [...this.drivers.map(d =>  [d.locationGeo.lat, d.locationGeo.lng]), [this.restaurant.locationGeo.lat,
      this.restaurant.locationGeo.lng]]  );
     // .push()
   // .concat(l)
// );
    // .push([this.restaurant.locationGeo.lat, this.restaurant.locationGeo.lng])
    // );
     console.log('displayDriversOnMap', this.driverMarkers);
     this.driverMarkers.forEach(driverMarker => {
      driverMarker.addTo(this.map);
      driverMarker.openPopup();
      driverMarker.on('click', (e: any) => {
        console.log('click event ', e.target._popup._content);

        const selectIndex = this.drivers.findIndex(d => d.user.name === e.target._popup._content);
        if (selectIndex !== -1) {
         this.onSelectDriver(selectIndex);
        }


      });
    });
  }

  updateDriversMarkers() {
    // this.map.fitBounds(this.drivers.map(d => [d.locationGeo.lat, d.locationGeo.lng]));
    console.log('updateDriversMarkers', this.driverMarkers);
    this.driverMarkers.forEach((driverMarker, index) => {
      driverMarker.setLatLng([this.drivers[index].locationGeo.lat, this.drivers[index].locationGeo.lng]);
    });
  }

  onDisplayMarkers() {
    this.displayDriversOnMap();
  }

  removeMarkers() {
    if (this.driverMarkers.length > 0) {
      this.driverMarkers.forEach(driverMarker => {
        driverMarker.removeFrom(this.map);
      });
    }
  }

  async closeModal() {
    console.log('closeModal');
    // await this.toastCtrl.dismiss();
    const modal = await this.modalCtrl.getTop();
    modal.dismiss();
  }

  onSelectDriver(index: number) {
    if (index === this.selectedDriverIndex) {
      console.log('in condition', index);
      // we click on the already selected driver,
      // thus we unselect it and set view globally on all drivers
      this.drivers[index].isSelected = false;
      this.driverMarkers[index].unbindPopup();
      // + ' - ' +this.drivers[index].delay + ' ago'
      this.driverMarkers[index].bindPopup(this.drivers[index].user.name, this.driverPopupOptions).openPopup();
   
      // display the map to fit all markers, drivers and restaurant
          // @ts-ignore
      this.map.fitBounds( [...this.drivers.map(d =>  [d.locationGeo.lat, d.locationGeo.lng]), [this.restaurant.locationGeo.lat,
      this.restaurant.locationGeo.lng]]  );
      return;
    }
    // Unselect all drivers
    this.selectedDriverIndex = index;
    this.drivers.forEach(d => d.isSelected = false);
    // Select clicked driver
    this.drivers[index].isSelected = true;
    this.driverMarkers[index].unbindPopup();
    this.driverMarkers[index].bindPopup(this.drivers[index].user.name + ' - ' + this.drivers[index].delay + ' ago',
    this.selectedDriverPopupOptions).openPopup();
    this.map.setView([this.drivers[index].locationGeo.lat, this.drivers[index].locationGeo.lng], 15);
  }

  calculateDelay( nowDate: Date, drivers: ExtendedDriver[]) {
    // console.log('calculateDelay1', drivers);
    drivers.forEach(driver => {
      const delayInMseconds = nowDate.getTime() - (new Date(driver.locationTime).getTime());
      const minutes =  Math.floor(delayInMseconds / (1000 * 60) % 60);
      const hours   = Math.floor(delayInMseconds / (1000 * 60 * 60) % 24 );
      const jours   = Math.floor(delayInMseconds / (1000 * 60 * 60 * 24));

      if ( jours === 0 && hours === 0) {
        driver.delay = minutes + 'm';
      } else if (jours === 0) {
        driver.delay =  hours + 'h' + minutes + 'm';
      } else {
        driver.delay = jours + 'j' + hours + 'h' + minutes + 'm';
      }
    });

    return drivers;



  }

  doRefresh(event) {
    console.log('Begin async operation');

    // this.orderService.fetchOrders_afterReset();

    this.staffDriversService.fetchDrivers_afterReset('ALL')
    .subscribe( drivers => event.target.complete());

    // this.staffService.fetchOrders_afterReset('').pipe(
    //   take(1)
    // )
    // .subscribe(orders => {
    //   console.log('doRefresh');
    //   event.target.complete();
    //   this.orders = orders as ExtendedOrder[];
    //   this.orders = this.calculateDelay(new Date(), [...this.orders]);
    // //   this.orders.forEach( order => {
    // //     order.delay = Math.abs((new Date().getTime() - new Date(order.createdAt).getTime()));
    // //   }
    // // );
    // });

  }





}
