import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService, Feature } from './../../services/geolocation.service';
import { Map, tileLayer, marker} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ModalController } from '@ionic/angular';

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


  constructor(
    private geolocationService: GeolocationService,
    private httpClient: HttpClient,
    private modalCtrl: ModalController
    ) { }

  ngOnInit() {
  }

  ngOnDestroy() {

  }

  ionViewDidEnter(){
    if (!this.mapLoaded) {
      this.loadMap();
      this.mapLoaded = true;
    }
    
  }

  onDismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'address': this.selectedAddress
    });
  }

  loadMap() {
    this.map = new L.Map("mapId").setView([45.508888, -73.561668], 13);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);


}

drawRoad(lat: number, lng: number) {

  if ( this.control !== undefined) {
    this.map.removeControl(this.control);
  }

  this.control = L.Routing.control({
    router: L.Routing.osrmv1({
        serviceUrl: `http://router.project-osrm.org/route/v1/`
    }),
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

getDistance(lat: number, lng: number) {

  console.log('getDistance');

  const headers = new HttpHeaders();
  headers.append('Host', 'router.project-osrm.org');

  const httpOptions1 = {
  headers: headers
};



  this.httpClient.get(
   // `http://router.project-osrm.org/route/v1/car/-73.596139,45.518281;-73.5939564,45.5832091?overview=false&alternatives=true&steps=true&hints=;`,
    //`http://router.project-osrm.org/table/v1/car/${lat},${lng};45.5832091,-73.5939564`,
    //'http://router.project-osrm.org/table/v1/driving/13.388860,52.517037;13.397634,52.529407;13.428555,52.523219?sources=0',
    'http://router.project-osrm.org/table/v1/driving/-73.596139,45.518281;-73.5939564,45.5832091?sources=0',
   httpOptions1
  )
  .subscribe( response => {
    console.log('distance', response);
  }

  )
  
  
}

locatePosition() {
  this.map.locate({ setView: true }).on("locationfound", (e: any) => {
    this.newMarker = marker([e.latitude, e.longitude], {
      draggable: true
    }).addTo(this.map);
    this.newMarker.bindPopup("You are located here!").openPopup();
    //this.getAddress(e.latitude, e.longitude); // This line is added
 
    this.newMarker.on("dragend", () => {
      const position = this.newMarker.getLatLng();
      //this.getAddress(position.lat, position.lng);// This line is added
     
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

  onSelect(address: string) {
    console.log('address', address);
    console.log('features', this.features);

  
    //this.newMarker.clearlayers();


    this.selectionDone = true;
    //get the address withing feature list to get coordinates
    const feature = this.features.find(f => f.place_name === address);

    this.customerFeature = feature;
    console.log('customerFeature',this.customerFeature);
    console.log('lng',this.customerFeature.geometry.coordinates[0]);
    const lng= this.customerFeature.geometry.coordinates[0];
    const lat= this.customerFeature.geometry.coordinates[1];

    
    
    

    this.addresses = [];
    
    this.selectedAddress = address;

    if (this.newMarker !== undefined) {
      console.log('in condition');
      //this.newMarker.removeFrom(this.map);
      const newLatLng = new L.LatLng(this.customerFeature.geometry.coordinates[1], this.customerFeature.geometry.coordinates[0]);
      this.newMarker.setLatLng(newLatLng);
      this.map = this.map.removeLayer(this.newMarker);
    } else {
      console.log('NOT in condition');
      this.newMarker = L.marker([this.customerFeature.geometry.coordinates[1], this.customerFeature.geometry.coordinates[0]], {
        draggable: true
      }).addTo(this.map);
    }

    
   


    this.newMarker.bindPopup("Delivery Address").openPopup();
    this.drawRoad(lat, lng);

    this.geolocationService.getDistance(lat, lng)
    .subscribe( response => {
      console.log('response', response);
    });
  }

  onSearchCancel() {
    this.selectionDone = false;
  }


}
