import { Component, OnInit, OnDestroy } from '@angular/core';
import { GeolocationService, Feature } from './../../services/geolocation.service';
import { Map, tileLayer, marker} from 'leaflet';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-driver-orders',
  templateUrl: './driver-orders.page.html',
  styleUrls: ['./driver-orders.page.scss'],
})
export class DriverOrdersPage implements OnInit, OnDestroy {

  constructor() { }

  ngOnInit() {
  }

  ngOnDestroy() {
    
  }

}
