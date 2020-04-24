import { User } from '../models/user.model';
import { SelectedItem } from '../models/selectedItem.model';
import { MenuItem } from '../models/menuItem.model';

export interface Order {
    _id: string;
    customer: User;
    selectedItems: MenuItem[];
    rawPrice: number;
    tipsPercentage: number;
    totalPrice: number;
    paymentMethod: string;
    collectionMethod: string;
}
