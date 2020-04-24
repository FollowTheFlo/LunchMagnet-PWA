import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'src/app/models/menuItem.model';
import { Order } from 'src/app/models/order.model';
import { ConfigItem } from './../models/configItem.model';
import { MenuService } from './../services/menu.service';
import { RestaurantService } from './../services/restaurant.service';
import { NavigationService } from './../services/navigation.service';
import { ModalController } from '@ionic/angular';
import { MenuItemPage } from './../shared-components/menu-item/menu-item.page';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.page.html',
  styleUrls: ['./shopping-cart.page.scss'],
})
export class ShoppingCartPage implements OnInit, OnDestroy {

  subTotal = 0;
  grandTotal = 0;
  tipsList: ConfigItem[] = [];
  taxList: ConfigItem[] = [];
  private menSub: Subscription;
  selectedMenuItems: MenuItem[] = [];
  selectedTips: ConfigItem;


  constructor(
    private menuService: MenuService,
    private restaurantService: RestaurantService,
    private navigationService: NavigationService,
    private modalCtrl: ModalController,
    private router: Router
    ) { }

  ngOnInit() {
    this.menSub = this.menuService.selectedMenuItems$
      .subscribe( selectedItems => {
        console.log('ShoppingCart selectedItems', selectedItems);
        this.selectedMenuItems = selectedItems;
        this.subTotal = this.getSubtotal();
        console.log('step1');
        this.grandTotal = this.getGrandTotal();
       // this.order.selectedItems = selectedItems;

      });

    this.restaurantService.getTipsList()
      .subscribe( tipsList => {
        console.log('getTipsList', tipsList);
        this.tipsList = tipsList;
        // find the selection by default
        const tip = tipsList.find(t => t.field1 === 'true');
        if ( tip !== undefined ) {
          console.log('not undefined', tip);
          this.selectedTips = tip;
          // set price of tips with floatValue field
          this.selectedTips.floatValue = Math.round(this.subTotal * (tip.intValue)) / 100;
          console.log('in Test', this.selectedTips);
          this.grandTotal = this.getGrandTotal();
        }

      });

    this.restaurantService.getTaxList()
      .subscribe( taxList => {
        this.taxList = taxList;
        this.grandTotal = this.getGrandTotal();
      });
  }

  ngOnDestroy() {
    if (this.menSub) {
      this.menSub.unsubscribe();
    }
  }

  ionViewDidEnter() {
    this.navigationService.setNavLink('SHOPPING_CART');

  }



  async onEditSelectedItem(itemIndex: number) {
    console.log('Modal editSelectedItem', itemIndex);
    console.log('presentModal');
    const modal = await this.modalCtrl.create({
        component: MenuItemPage,
        componentProps: {
          action: 'edit',
          itemIndex
        },

      });

    modal.onDidDismiss()
      .then(() => {
       console.log('modal.onDidDismiss');
       if ( this.selectedMenuItems.length === 0) {
        console.log('in condition No selected items');
        this.router.navigate(['tabs/home']);
       }


      });
    return await modal.present();
  }

  onRemoveSelectedItem(itemIndex: number) {
    console.log('onRemoveSelectedItem');
    this.menuService.removeSelectedMenuItem(itemIndex);

    if ( this.selectedMenuItems.length === 0) {
      console.log('in condition No selected items');
      this.router.navigate(['tabs/home']);
     }
  }

  getSubtotal() {
    let price = 0;
    this.selectedMenuItems.forEach(item => {
      price += item.totalPrice;
    });

    return price;
  }

  getGrandTotal() {
    console.log('getGrandTotal1');

    this.taxList.forEach(tax => {
      tax.intValue = Math.round(this.subTotal  * tax.floatValue) / 100;
    });
    let price = 0;
    // add tips price
    if (this.selectedTips)
    {
      this.selectedTips.floatValue = Math.round(this.subTotal * (this.selectedTips.intValue)) / 100;
      console.log('getGrandTotal2', this.selectedTips.intValue);
      price = Math.round(this.subTotal * (100 + this.selectedTips.intValue)) / 100;
    }
    // add taxes price
    this.taxList.forEach(tax => {
      price += tax.intValue;
    });

    console.log('selectedTips', this.selectedTips);

    return Math.round(price * 100) / 100;
    //return this.subTotal / 100;
  }

  onAddTips(tip: ConfigItem) {
    console.log('onAddTips', tip);
    this.clearChipSelection();
    this.selectedTips = tip;
    this.selectedTips.floatValue = Math.round(this.subTotal * (tip.intValue))/100;
    tip.selected = true;
    this.grandTotal = this.getGrandTotal();
  }

  clearChipSelection() {
    this.tipsList.forEach(tip => tip.selected = false);
  }

  // getItemPrice(item: MenuItem) {
  //   let totalItemPrice = 0;

  //   // collect price of toppings that belong to Options
  //   item.options.forEach( option => {
  //     option.toppings.forEach( topping => {
  //       if (topping.selected === true) {
  //         totalItemPrice += topping.price;
  //       }
  //     });
  //   });

  //   // multiply by number of items
  //   totalItemPrice *= item.quantity;

  //   return totalItemPrice;
  // }

}
