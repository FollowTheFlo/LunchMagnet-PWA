import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService, Feature } from './../../services/geolocation.service';
import { Map, tileLayer, marker} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalController, NavParams } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-address-search',
  templateUrl: './address-search.page.html',
  styleUrls: ['./address-search.page.scss'],
})
export class AddressSearchPage implements OnInit, OnDestroy {

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
  outputLat = 0;
  outputLng = 0;



  constructor(
    private geolocationService: GeolocationService,
    private httpClient: HttpClient,
    private modalCtrl: ModalController,
    private navParams: NavParams
    ) { 
      this.inputAction = navParams.get('action');
      this.inputLat = navParams.get('lat');
      this.inputLng = navParams.get('lng');
      this.inputAddress = navParams.get('address');
    }

  ngOnInit() {
  
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
    if (this.inputAction === 'SHOW') {
      this.displayLatLngText(this.inputLat,this.inputLng, this.inputAddress);
    }

  }

  onDismiss(value: string) {
    console.log('onDismiss this.selectedAddress', this.selectedAddress);
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    if ( value === 'save' ) {
    this.selectedAddress = this.selectedAddress === null ? '' : this.selectedAddress;
    this.modalCtrl.dismiss({
      address: this.selectedAddress,
      lat: this.outputLat,
      lng: this.outputLng,
      action : 'save'
    });
    } else {
      this.modalCtrl.dismiss({
        address: undefined,
        action : 'cancel'
      });
    }
  }

  loadMap() {
    this.map = new L.Map("mapId").setView([45.508888, -73.561668], 13);

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);


}

drawRoad(lat: number, lng: number) {
    console.log('drawRoad');
    if ( this.control !== undefined) {
    this.map.removeControl(this.control);
  }

    this.control = L.Routing.control({
    //@ts-ignore
    router:  L.Routing.mapbox(environment.mapbox.accessToken, { profile : 'mapbox/driving' }),

    // L.Routing.osrmv1({
    //     //serviceUrl: `http://router.project-osrm.org/route/v1/`
    //     serviceUrl:`https://geoegl.msp.gouv.qc.ca/services/itineraire/route/v1/`
       
    // }),
    showAlternatives: false,
    lineOptions: {styles: [{color: '#242c81', weight: 7}]},
    fitSelectedRoutes: false,
    altLineOptions: {styles: [{color: '#ed6852', weight: 7}]},
    show: false,
    routeWhileDragging: true,
    waypoints: [
        L.latLng(lat, lng),
        L.latLng(45.5832091, -73.5939564)
    ]
  }).addTo(this.map);

    console.log(' this.control',  this.control);
}


locatePosition() {
  this.map.locate({ setView: true }).on("locationfound", (e: any) => {
    this.newMarker = marker([e.latitude, e.longitude], {
      draggable: true
    }).addTo(this.map);
    this.newMarker.bindPopup("You are located here!").openPopup();
    // this.getAddress(e.latitude, e.longitude); // This line is added

    this.newMarker.on("dragend", () => {
      const position = this.newMarker.getLatLng();
      // this.getAddress(position.lat, position.lng);// This line is added

    });
  });
}

  search(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    if (searchTerm && searchTerm.length > 0 && !this.selectionDone) {
      this.geolocationService
        .search_word(searchTerm)
        .subscribe((features: Feature[]) => {
          this.features = features;
          console.log("features", this.features);
          this.addresses = features.map(feat => feat.place_name);
        });
      } else {
        this.addresses = [];
      }
  }

  displayLatLngText(lat: number, lng: number, text: string) {

    if (this.newMarker !== undefined) {
      console.log('in condition');
      // this.newMarker.removeFrom(this.map);
      const newLatLng = new L.LatLng(lat, lng);
      this.newMarker.setLatLng(newLatLng);
      //this.map = this.map.removeLayer(this.newMarker);
    } else {
      console.log('NOT in condition');
      this.newMarker = L.marker([lat, lng], {
        draggable: true
      }).addTo(this.map);
    }

    this.newMarker.bindPopup(text).openPopup();
    
  }

  onOpenGoogleMap() {
    console.log('onOpenGoogleMap');
    //?q="${this.restaurant.address}"
    //window.open(`geo:${this.restaurant.locationGeo.lat},${this.restaurant.locationGeo.lng}`,
    //window.open(`geo:0,0?q=${this.inputAddress}`,`_system`);
  }

  onSelectAddress(address: string) {
    console.log('address', address);
    console.log('features', this.features);


    // this.newMarker.clearlayers();


    this.selectionDone = true;
    // get the address withing feature list to get coordinates
    const feature = this.features.find(f => f.place_name === address);

    this.customerFeature = feature;
    console.log('customerFeature', this.customerFeature);
    console.log('lng', this.customerFeature.geometry.coordinates[0]);
    const lng = this.customerFeature.geometry.coordinates[0];
    const lat = this.customerFeature.geometry.coordinates[1];

    this.outputLat = this.customerFeature.geometry.coordinates[1];
    this.outputLng = this.customerFeature.geometry.coordinates[0];


    this.addresses = [];

    this.selectedAddress = address;

    if (this.newMarker !== undefined) {
      console.log('in condition');
      // this.newMarker.removeFrom(this.map);
      const newLatLng = new L.LatLng(this.customerFeature.geometry.coordinates[1], this.customerFeature.geometry.coordinates[0]);
      this.newMarker.setLatLng(newLatLng);
      //this.map = this.map.removeLayer(this.newMarker);
    } else {
      console.log('NOT in condition');
      this.newMarker = L.marker([this.customerFeature.geometry.coordinates[1], this.customerFeature.geometry.coordinates[0]], {
        draggable: true
      }).addTo(this.map);
    }





    this.newMarker.bindPopup(this.selectedAddress).openPopup();
    // this.drawRoad(lat, lng);

    // this.geolocationService.getDistance(lat, lng)
    // .subscribe( response => {
    //   console.log('Time from Restaurant is', response);
    // });
  }

  onSearchCancel() {
    this.selectionDone = false;
  }


}
