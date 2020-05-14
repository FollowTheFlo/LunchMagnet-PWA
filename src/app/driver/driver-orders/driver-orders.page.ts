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
          draggable: true
        }).addTo(this.map);
        this.driverMarker.bindPopup('My location', this.popupOptions).openPopup();
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
      draggable: true
    }).addTo(this.map);
   // const popup = L.Popup.

    this.driverMarker.bindPopup('My location', this.popupOptions).openPopup();
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

    this.driverMarker.unbindPopup();
    this.driverMarker.bindPopup('New location', this.popupOptions2).openPopup();
  }



}
