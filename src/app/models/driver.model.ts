import { LocationGeo } from '../models/locationGeo.model';

export interface Driver {
    _id: string;
    user: string;
    locationGeo: LocationGeo;
    locationTime: string;
    distanceToRestaurant: number;
    timeToRestaurant: number;
    available: boolean;
    status: string;
  }