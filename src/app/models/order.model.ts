import { User } from '../models/user.model';
import { SelectedItem } from '../models/selectedItem.model';

export interface Order {
    _id: string;
    customer: User;
    selectedItems: SelectedItem[];
    rawPrice: number;
    tipsPercentage: number;
    totalPrice: number;
    paymentMethod: string;
    collectionMethod: string;
}
