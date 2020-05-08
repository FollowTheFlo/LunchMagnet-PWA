import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService, Feature } from './../../services/geolocation.service';
import { DriverService } from './../../services/driver.service';
import { Map, tileLayer, marker} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Plugins } from '@capacitor/core';
import { of, from } from 'rxjs';
import { Driver } from 'src/app/models/driver.model';
const { Geolocation } = Plugins;

@Component({
  selector: 'app-driver-orders',
  templateUrl: './driver-orders.page.html',
  styleUrls: ['./driver-orders.page.scss'],
})
export class DriverOrdersPage implements OnInit, OnDestroy {
  map: L.Map;
  control: L.Routing.Control;
  newMarker: L.Marker;
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
    private driverService: DriverService
  ) { }

  ngOnInit() {
    this.driverService.fetchDriver('5e8f3fd01986990acb872db9')
    .subscribe(driver => {
      console.log('driver', driver);
      this.driver = driver;
    });
  }

  ngOnDestroy() {
    
  }

  ionViewDidEnter() {
    if (!this.mapLoaded) {
      this.loadMap();
      this.mapLoaded = true;
    }

    console.log('ionViewDidEnter', this.inputAction );
    // display Restaurant location address
   

  }

  loadMap() {
    this.map = new L.Map('driverMapId').setView([45.508888, -73.561668], 13);
    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
}

   getCurrentPosition() {
    
      return from(Geolocation.getCurrentPosition());
   }

   drawCurrentPosition() {

    this.getCurrentPosition()
    .subscribe( coordinates => {
      console.log('coordinates', coordinates);
      this.newMarker = marker([coordinates.coords.latitude, coordinates.coords.longitude], {
        draggable: true
      }).addTo(this.map);
      this.newMarker.bindPopup("My location").openPopup();
      this.driver.locationGeo.lat = coordinates.coords.latitude;
      this.driver.locationGeo.lng = coordinates.coords.longitude;
      this.driver.locationTime = coordinates.timestamp.toString();

      this.driverService.updateDriver(JSON.parse(JSON.stringify(this.driver)))
      .subscribe(driver => {
        console.log('updateDriver', driver);
    },
      error =>  console.log('updateDriver Error', error)
    );
    });

  }

  onToggleChange() {
    console.log('onToggleChange()');
    this.driver.available = !this.driver.available;

    this.driverService.updateDriver(JSON.parse(JSON.stringify(this.driver)))
      .subscribe(driver => {
        console.log('onToggleChange updateDriver', driver);
    },
      error =>  console.log('updateDriver Error', error)
    );
  }

}
