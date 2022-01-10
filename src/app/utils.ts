import { ConfigItem } from "./models/configItem.model";
import { Driver } from "./models/driver.model";
import { LocationGeo } from "./models/locationGeo.model";
import { MenuByCategory } from "./models/menuCategory.model";
import { MenuItem } from "./models/menuItem.model";
import { OpeningSlot } from "./models/openingSlot.model";
import { Option } from "./models/option.model";
import { HistoryItem, Order } from "./models/order.model";
import { Restaurant } from "./models/restaurant.model";
import { SelectedItemDB } from "./models/selectedItemDB.model";
import { Step } from "./models/step.model";
import { Topping } from "./models/topping.model";
import { User } from "./models/user.model";

export default class Utils {
  static deepCopyOrdersList(l: Order[]): Order[] {
    return l?.map((o) => this.deepCopyOrder(o)) ?? null;
  }
  static deepCopyOrder(o: Order): Order {
    return {
      ...o,
      customer: this.deepCopyUser(o.customer),
      selectedMenuItems: this.deepCopyMenuItemsList(o.selectedMenuItems),
      selectedItems: this.deepCopySelectedItemDBsList(o.selectedItems),
      tips: this.deepCopyConfigItem(o.tips),
      taxes: this.deepCopyConfigItemsList(o.taxes),
      history: this.deepCopyHistoryItemsList(o.history),
      deliveryLocationGeo: this.deepCopyLocationGeo(o.deliveryLocationGeo),
      steps: this.deepCopyStepsList(o.steps),
      currentStep: this.deepCopyStep(o.currentStep),
      driver: this.deepCopyDriver(o.driver),
      pendingDriver: this.deepCopyDriver(o.pendingDriver),
      restaurant: this.deepCopyRestaurant(o.restaurant),
    };
  }

  static deepCopyHistoryItem(i: HistoryItem): HistoryItem {
    return { ...i };
  }
  static deepCopyHistoryItemsList(l: HistoryItem[]): HistoryItem[] {
    if (!l || l === []) return [];
    return l.map((i) => this.deepCopyHistoryItem(i));
  }

  static deepCopyUser(u: User): User {
    if (!u) return null;
    return {
      ...u,
      deliveryLocationGeo: this.deepCopyLocationGeo(u.deliveryLocationGeo),
    };
  }

  static deepCopySelectedItemDB(i: SelectedItemDB): SelectedItemDB {
    return { ...i };
  }
  static deepCopySelectedItemDBsList(l: SelectedItemDB[]): SelectedItemDB[] {
    return l.map((i) => this.deepCopySelectedItemDB(i));
  }

  static deepCopyMenuItem(mi: MenuItem): MenuItem {
    return { ...mi, options: this.deepCopyOptionsList(mi.options) };
  }
  static deepCopyMenuItemsList(l: MenuItem[]): MenuItem[] {
    if (!l || l === []) return [];
    return l.map((mi) => this.deepCopyMenuItem(mi));
  }
  static deepCopyOption(o: Option): Option {
    return {
      ...o,
      toppings: this.deepCopyToppingsList(o.toppings),
    };
  }
  static deepCopyOptionsList(l: Option[]): Option[] {
    if (!l || l === []) return [];
    return l.map((o) => this.deepCopyOption(o));
  }
  static deepCopyTopping(t: Topping): Topping {
    return { ...t };
  }
  static deepCopyToppingsList(l: Topping[]): Topping[] {
    if (!l || l === []) return [];
    return l.map((t) => this.deepCopyTopping(t));
  }

  static deepCopyConfigItem(i: ConfigItem): ConfigItem {
    return { ...i };
  }
  static deepCopyConfigItemsList(l: ConfigItem[]): ConfigItem[] {
    if (!l || l === []) return [];
    return l.map((i) => this.deepCopyConfigItem(i));
  }

  static deepCopyLocationGeo(l: LocationGeo): LocationGeo {
    if (!l) return null;
    return { ...l };
  }

  static deepCopyStep(s: Step): Step {
    return { ...s };
  }
  static deepCopyStepsList(l: Step[]): Step[] {
    return l.map((s) => this.deepCopyStep(s));
  }

  static deepCopyDriver(d: Driver): Driver {
    return {
      ...d,
      user: this.deepCopyUser(d?.user ?? null),
      locationGeo: this.deepCopyLocationGeo(d?.locationGeo ?? null),
    };
  }

  static deepCopyDriversList(l: Driver[]): Driver[] {
    return l.map((d) => this.deepCopyDriver(d));
  }

  static deepCopyRestaurant(r: Restaurant): Restaurant {
    return {
      ...r,
      locationGeo: this.deepCopyLocationGeo(r?.locationGeo ?? null),
      openingHours: this.deepCopyOpeningSlotsList(r?.openingHours ?? []),
    };
  }
  static deepCopyOpeningSlot(s: OpeningSlot): OpeningSlot {
    return { ...s };
  }
  static deepCopyOpeningSlotsList(l: OpeningSlot[]): OpeningSlot[] {
    return l.map((s) => this.deepCopyOpeningSlot(s));
  }
  static deepCopyMenuByCategory(m: MenuByCategory): MenuByCategory {
    return {
      ...m,
      menuItems: this.deepCopyMenuItemsList(m.menuItems),
    };
  }
  static deepCopyMenuByCategoriesList(l: MenuByCategory[]): MenuByCategory[] {
    return l.map((m) => this.deepCopyMenuByCategory(m));
  }
}
