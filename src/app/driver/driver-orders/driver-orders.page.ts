import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService, Feature } from './../../services/geolocation.service';
import { DriverService } from './../../services/driver.service';
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

  constructor(
    private geolocationService: GeolocationService,
    private driverService: DriverService,
    private authService: AuthService
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
        this.driverMarker.bindPopup('My location').openPopup();
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
    //   console.log('coordinates', coordinates);
    //   this.driverMarker = marker([coordinates.coords.latitude, coordinates.coords.longitude], {
    //     draggable: true
    //   }).addTo(this.map);
    //   this.driverMarker.bindPopup('My location').openPopup();
    //   this.driver.locationGeo.lat = coordinates.coords.latitude;
    //   this.driver.locationGeo.lng = coordinates.coords.longitude;
    //   this.driver.locationTime = coordinates.timestamp.toString();

    //   this.driverService.updateDriver(JSON.parse(JSON.stringify(this.driver)))
    //   .subscribe(driver => {
    //     console.log('updateDriver', driver);
    // },
    //   error =>  console.log('updateDriver Error', error)
    // );
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
    this.driverMarker.bindPopup('My location').openPopup();
    this.driver.locationGeo.lat = lat;
    this.driver.locationGeo.lng = lng;
    this.driver.locationTime = new Date().toISOString();
    this.driver.status = 'ACTIVE';

    this.driverService.updateDriver(JSON.parse(JSON.stringify(this.driver)))
    .subscribe(driver => {
      console.log('updateDriver', driver);
  },
    error =>  console.log('updateDriver Error', error)
  );
  }


  onToggleChange(event) {
    console.log('onToggleChange()', event);
    
    // console.log('onToggleChange() 1');
    // if(event.detail.value !== this.driver.available) {
    //   console.log('onToggleChange() 2');
    //   this.driver.available = !this.toggleChecked;

    // }

   // if (!this.driverLoading) {
    console.log('onToggleChange() 1 available: ', this.driver.available);
    this.driver.locationTime = new Date().toISOString();
    this.driverService.updateDriver(JSON.parse(JSON.stringify(this.driver)))
        .subscribe(driver => {
          console.log('onToggleChange updateDriver', driver);
      },
        error =>  console.log('updateDriver Error', error)
      );
  // } else {
  //   console.log('onToggleChange() 2');
  // }
}

}
