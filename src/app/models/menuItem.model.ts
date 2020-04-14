import { Topping } from '../models/topping.model';

export interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    toppings: Topping[];
    notes: string;
    isAvailable: boolean;
    mainImageUrl: string;
}
