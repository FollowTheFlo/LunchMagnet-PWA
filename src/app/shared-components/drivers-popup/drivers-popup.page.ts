import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService, Feature } from './../../services/geolocation.service';
import { StaffDriversService} from './../../services/staff-drivers.service';
import { SocketService} from './../../services/socket.service';
import { Map, tileLayer, marker} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalController, NavParams } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { Driver } from 'src/app/models/driver.model';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-drivers-popup',
  templateUrl: './drivers-popup.page.html',
  styleUrls: ['./drivers-popup.page.scss'],
})
export class DriversPopupPage implements OnInit, OnDestroy {
  drivers: Driver[] = [];
  map: L.Map;
  control: L.Routing.Control;
  newMarker: L.Marker;
  driverMarkers: L.Marker[] = [];
  address: string[];

  addresses: string[] = [];
  selectedAddress = null;
  selectionDone = false;
  features: Feature[] = [];
  customerFeature = undefined;
  mapLoaded = false;
  socketSub: Subscription;
  driversSub: Subscription;

  constructor(
    private staffDriversService: StaffDriversService,
    private modalCtrl: ModalController,
    private socketService: SocketService
  ) { }

  ngOnInit() {
    this.driversSub = this.staffDriversService.fetchDrivers('ALL')
    .pipe(
      switchMap(drivers => this.staffDriversService.drivers$)
    )
    .subscribe( drivers => {
      console.log('drivers ', drivers);
      this.drivers = drivers;
      // this.drivers = drivers.filter(driver => driver.locationGeo.lat !== 0 );
      if (this.map) {
        this.fillDriverMarkers();
        this.displayDriversOnMap();
      }
     
    });

    this.socketSub = this.socketService.getMessages('STAFF_DRIVERS')
  .subscribe(socketData => {

    console.log('socket', socketData );

    if (socketData.action === 'UPDATE') {
        //this.staffService.updateOrderLocally(socketData.order as Order);
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

    this.fillDriverMarkers();
    this.displayDriversOnMap();

}

  fillDriverMarkers() {
    console.log('fillDriverMarkers', this.driverMarkers);
    this.removeMarkers();
    this.drivers.forEach((driver, index) => {
      // Don't create marker for driver that are not ini with lat value 0
      if (driver.locationGeo.lat !== 0) {
        this.driverMarkers[index] = marker([driver.locationGeo.lat, driver.locationGeo.lng], {
          draggable: true
        });
        this.driverMarkers[index].bindPopup(driver.user.name,{closeOnClick: false, autoClose: false});
      }
    
      // this.newMarker.bindPopup("My location").openPopup();
    });
  }

  displayDriversOnMap() {
    console.log('displayDriversOnMap', this.driverMarkers);
    this.driverMarkers.forEach(driverMarker => {
      driverMarker.addTo(this.map)
      driverMarker.openPopup();
      driverMarker.on('click', (e: any) => {
        console.log('click event ', e.target._popup._content);
       
      });
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





}
