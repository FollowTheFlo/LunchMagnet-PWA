import { LocationGeo } from '../models/locationGeo.model';
import { OpeningSlot } from '../models/openingSlot.model';

export interface Restaurant {
    _id: string;
    name: string;
    address: string;
    locationGeo: LocationGeo;
    phoneNumber: string;
    openingHours: OpeningSlot[];
    mainImageUrl: string;
}