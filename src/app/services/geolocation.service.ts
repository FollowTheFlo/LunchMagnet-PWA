import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import * as L from 'leaflet';

export interface MapboxOutput {
    attribution: string;
    features: Feature[];
    query: [];
  }
  
export interface Feature {
    place_name: string;
    geometry: {
        type: string,
        coordinates: number[]
    }
  }

export interface Coordinates {
    lng: number;
    lat: number;
  }
  
@Injectable({
    providedIn: 'root'
  })
  export class GeolocationService {
    //httpClient: any;
    //map: L.Map;
  
    constructor(private httpClient: HttpClient) { }

  
    search_word(query: string) {
      const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
      return this.httpClient.get(url + query + '.json?types=address&access_token='
      + environment.mapbox.accessToken)
      .pipe(map((res: MapboxOutput) => {
          console.log('res', res);
          return res.features;
      }));
    }

    getDistance(latFrom: number, lngFrom: number, latTo: number, lngTo: number) {
      console.log('getDistance');
      const headers = new HttpHeaders();
      headers.append('Host', 'router.project-osrm.org');

      const httpOptions1 = {
          headers: headers
       };



      return this.httpClient.get(
          //`http://router.project-osrm.org/table/v1/driving/-73.5939564,45.5832091;${lng},${lat}?sources=0`,
          //`https://geoegl.msp.gouv.qc.ca/services/itineraire/route/v1/driving/-73.5939564,45.5832091;${lng},${lat}?sources=0`,
          `https://api.mapbox.com/directions-matrix/v1/mapbox/driving-traffic/${lngTo},${latTo};${lngFrom},${latFrom}?annotations=duration,distance&sources=0&access_token=${environment.mapbox.accessToken}`,
          httpOptions1
        ).pipe(
          map( response => {
            console.log('get response', response);
            const mapBoxResponse = response as any;
            return {
              success: mapBoxResponse.code === 'Ok' ? true : false,
              duration: Math.round(mapBoxResponse.durations[0][1] / 60),
              distance: Math.round(mapBoxResponse.distances[0][1] / 100) / 10}
          })
        );

        
     }


  }