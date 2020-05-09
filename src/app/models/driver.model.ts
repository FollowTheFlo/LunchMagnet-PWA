import { LocationGeo } from '../models/locationGeo.model';
import { User } from '../models/user.model';

export interface Driver {
    _id: string;
    user: User;
    locationGeo: LocationGeo;
    locationTime: string;
    distanceToRestaurant: number;
    timeToRestaurant: number;
    available: boolean;
    status: string;
  }