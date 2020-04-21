import { Option } from '../models/option.model';

export interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    options: Option[];
    notes: string;
    isAvailable: boolean;
    mainImageUrl: string;
    quantity: number;
}
