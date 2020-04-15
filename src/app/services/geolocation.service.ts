import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
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
  
    constructor(private http: HttpClient) { }
  
    search_word(query: string) {
      const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';
      return this.http.get(url + query + '.json?types=address&access_token='
      + environment.mapbox.accessToken)
      .pipe(map((res: MapboxOutput) => {
          console.log('res',res);
          return res.features;
      }));
    }
  }