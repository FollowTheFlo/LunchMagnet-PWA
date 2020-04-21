import { Topping } from '../models/topping.model';

export interface Option {
    name: string;
    name_fr: string;
    description: string;
    description_fr: string;
    min: number;
    max: number;
    exactNumber: number;
    required: boolean;
    active: boolean;
    toppings: Topping[];
    menuType: string;
}