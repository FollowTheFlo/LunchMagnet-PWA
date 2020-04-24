import { Option } from '../models/option.model';

export interface MenuItem {
    _id: string;
    name: string;
    name_fr: string;
    description: string;
    description_fr: string;
    categoryName: string;
    categoryName_fr: string;
    price: number;
    category: string;
    options: Option[];
    notes: string;
    isAvailable: boolean;
    mainImageUrl: string;
    quantity: number;
    totalPrice: number;
}
