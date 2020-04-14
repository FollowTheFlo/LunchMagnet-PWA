import { Topping } from '../models/topping.model';
import { MenuItem } from '../models/menuItem.model';

export interface SelectedItem {
    menuItem: MenuItem;
    quantity: number;
    price: number;
    selectedToppings: Topping[];
    comments: string;
}
