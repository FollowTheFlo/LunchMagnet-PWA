import { MenuItem } from "./menuItem.model";

export interface MenuCategory {
  _id: string;
  name: string;
  name_fr: string;
  description: string;
  description_fr: string;
  price: number;
  code: string;
  index: number;
  notes: string;
  active: boolean;
  imageUrl: string;
}

export interface MenuByCategory extends MenuCategory {
  menuItems: MenuItem[];
}
