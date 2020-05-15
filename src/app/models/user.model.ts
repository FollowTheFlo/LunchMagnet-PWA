import { LocationGeo } from '../models/locationGeo.model';

export interface User {
    _id: string;
    username: string;
    name: string;
    email: string;
    password: string;
    collectionMethod: string;
    deliveryAddress: string;
    role: string;
    view: string;
    deliveryLocationGeo: LocationGeo;
  }