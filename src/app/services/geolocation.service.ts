import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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
  
    constructor(private httpClient: HttpClient) { }
  
    search_word(query: string) {
      const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
      return this.httpClient.get(url + query + '.json?types=address&access_token='
      + environment.mapbox.accessToken)
      .pipe(map((res: MapboxOutput) => {
          console.log('res',res);
          return res.features;
      }));
    }

    getDistance(lat: number, lng: number) {
      console.log('getDistance');
       const headers = new HttpHeaders();
       headers.append('Host', 'router.project-osrm.org');

       const httpOptions1 = {
          headers: headers
       };



       return this.httpClient.get(
        // `http://router.project-osrm.org/route/v1/car/-73.596139,45.518281;-73.5939564,45.5832091?overview=false&alternatives=true&steps=true&hints=;`,
          //`http://router.project-osrm.org/table/v1/car/${lat},${lng};45.5832091,-73.5939564`,
          //'http://router.project-osrm.org/table/v1/driving/13.388860,52.517037;13.397634,52.529407;13.428555,52.523219?sources=0',
          `http://router.project-osrm.org/table/v1/driving/-73.5939564,45.5832091;${lng},${lat}?sources=0`,
          httpOptions1
        );

        
     }


  }