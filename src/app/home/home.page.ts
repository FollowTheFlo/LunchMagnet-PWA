import { Component } from '@angular/core';
import { GeolocationService, Feature } from './../services/geolocation.service';
import { Map, tileLayer, marker} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private geolocationService: GeolocationService) {}

  //map: Map;
  map: L.Map;
  newMarker: any;
  address: string[];

  addresses: string[] = [];
  selectedAddress = null;
  selectionDone = false;
  features: Feature[] = [];
  customerFeature = undefined;
  mapLoaded = false;

  ionViewDidEnter(){
    if (!this.mapLoaded) {
      this.loadMap();
      this.mapLoaded = true;
    }
    
  }
//http://router.project-osrm.org/route/v1/car/-73.596139,45.518281;-73.5939564,45.5832091?overview=false&alternatives=true&steps=true&hints=;
  loadMap() {
    this.map = new L.Map("mapId").setView([45.508888, -73.561668], 13);
  //   L.tileLayer(
  //     'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  //   { attribution:
  //     `Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors,
  //     <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-
  //      SA</a>`
  //   })
  // .addTo(this.map);
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);


}

drawRoad(lat: number, lng: number) {
  L.Routing.control({
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
        //L.latLng(-73.596139, 45.518281),
        //L.latLng(-73.5939564, 45.5832091)
        L.latLng(lat, lng),
        L.latLng(45.5832091, -73.5939564)
    ]
  }).addTo(this.map);
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
          this.addresses = features.map(feat => feat.place_name);
        });
      } else {
        this.addresses = [];
      }
  }

  onSelect(address: string) {
    console.log('address', address);
    console.log('features', this.features);
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

    this.newMarker = L.marker([this.customerFeature.geometry.coordinates[1], this.customerFeature.geometry.coordinates[0]], {
      draggable: true
    }).addTo(this.map);
    this.newMarker.bindPopup("Delivery Address").openPopup();
    this.drawRoad(lat, lng);
  }

  onSearchCancel() {
    this.selectionDone = false;
  }

}