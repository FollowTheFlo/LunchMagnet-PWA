import { User } from '../models/user.model';
import { SelectedItem } from '../models/selectedItem.model';
import { MenuItem } from '../models/menuItem.model';
import { SelectedItemDB } from '../models/selectedItemDB.model';
import { ConfigItem } from './../models/configItem.model';
import { Restaurant } from './restaurant.model';

export interface Order {
    _id: string;
    customer: User;
    selectedMenuItems: MenuItem[];
    selectedMenuItemsString: string;
    selectedItems: SelectedItemDB[];
    rawPrice: number;
    tips: ConfigItem;
    taxes: ConfigItem[];
    subTotalPrice: number;
    status: string;
    totalPrice: number;
    paymentMethod: string;
    collectionMethod: string;
    history: [{action: string, date: Date, userId: string}];
}
