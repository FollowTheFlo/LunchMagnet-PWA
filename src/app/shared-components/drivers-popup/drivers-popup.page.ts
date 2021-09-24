import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService, Feature } from './../../services/geolocation.service';
import { StaffDriversService} from './../../services/staff-drivers.service';
import { StaffService } from './../../services/staff.service';
import { SocketService} from './../../services/socket.service';
import { OrderService} from './../../services/order.service';
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
import { Order } from 'src/app/models/order.model';

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
  targetOrderMarker: L.Marker;
  map: L.Map;
  order: Order;
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

  houseIcon = L.icon({
    iconUrl: 'assets/markers/home-sharp.png',
    iconSize:     [25, 25], // size of the icon
     popupAnchor:  [0, -10] // point from which the popup should open relative to the iconAnchor
});



  constructor(
    private staffDriversService: StaffDriversService,
    private staffService: StaffService,
    private modalCtrl: ModalController,
    private restaurantService: RestaurantService,
    private orderService: OrderService,
    private navParams: NavParams
  ) {
    this.order = navParams.get('order');
    console.log('constructor', this.order);
  }

  ngOnInit() {
    console.log('ngOnInit DriversPopup');
    const driversSub = this.restaurantService.fetchRestaurant().pipe(
    switchMap( restaurant => {
      this.restaurant = restaurant as Restaurant;
      return this.staffDriversService.fetchDrivers_afterReset('ALL');
    })
    )
    .subscribe( drivers => {
      console.log('DriversPopup Drivers ', drivers);

  
      this.drivers = drivers as ExtendedDriver[];

      this.drivers = this.calculateDelay(new Date(), [...this.drivers]);
      // file the isSelected property to false as initial state, no driver selected
      // if one was previously selected, set true at slected Index
      this.drivers.forEach((driver, index) => {
        driver.isSelected = index === this.selectedDriverIndex ? true : false;
      });

       // this.drivers = drivers.filter(driver => driver.locationGeo.lat !== 0 );


      if (this.map) {

          this.fillDriverMarkers();
          this.displayDriversOnMap();

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
    this.drawTargetOrderMarker(this.order);
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

  drawTargetOrderMarker(order: Order) {
    console.log('drawTargetOrderMarker', order.deliveryAddress);
    if (this.targetOrderMarker) {
      this.targetOrderMarker.removeFrom(this.map);
    }
    if (this.order) {
     
      this.targetOrderMarker = marker([order.deliveryLocationGeo.lat, order.deliveryLocationGeo.lng], {
        icon: this.houseIcon,
        draggable: false
      }).addTo(this.map);
      this.targetOrderMarker.bindPopup(order.deliveryAddress, this.driverPopupOptions);
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

     // display the map to fit all markers, drivers, restaurant and target order
     // @ts-ignore
     this.map.fitBounds( [...this.drivers.map(d =>  [d.locationGeo.lat, d.locationGeo.lng]), [this.restaurant.locationGeo.lat,
      this.restaurant.locationGeo.lng], [this.order.deliveryLocationGeo.lat, this.order.deliveryLocationGeo.lng]]  );

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
        driver.delay = jours + 'd' + hours + 'h' + minutes + 'm';
      }
    });

    return drivers;



  }

   onClickConfirm() {
    console.log('onClickConfirm');
    const selectedDriver = this.drivers.find(driver => driver.isSelected === true);
    console.log('selected driver', selectedDriver, this.order._id );
    this.orderService.askDriverToTakeOrder(selectedDriver._id, this.order._id)
    .pipe(
      switchMap(order =>  {
        console.log('updated order', order);
        return this.staffService.completeOrderStep(this.order._id, this.order.currentStepIndex);
      })
    )
    .subscribe( order => {
      console.log('Step updated order', order);
      this.modalCtrl.getTop().then(modal => {
        modal.dismiss(JSON.parse(JSON.stringify(order)));
      });

    });
  }

  // doRefresh(event) {
  //   console.log('Begin async operation');
  //   this.staffDriversService.fetchDrivers_afterReset('ALL')
  //   .subscribe( drivers => event.target.complete());
  // }
}
