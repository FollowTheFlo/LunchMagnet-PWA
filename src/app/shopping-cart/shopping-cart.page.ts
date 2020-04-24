import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'src/app/models/menuItem.model';
import { Order } from 'src/app/models/order.model';
import { ConfigItem } from './../models/configItem.model';
import { User } from './../models/user.model';
import { MenuService } from './../services/menu.service';
import { UserService } from './../services/user.service';
import { OrderService } from './../services/order.service';
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

  currentUser: User;
  seeSubTotalDetails = false;
  selectedCollectionMethod = 'delivery';
  checkoutStep = false;
  headerTitle = 'Shopping-Cart';
  subTotal = 0;
  grandTotal = 0;
  tipsList: ConfigItem[] = [];
  taxList: ConfigItem[] = [];
  private menSub: Subscription;
  selectedMenuItems: MenuItem[] = [];
  selectedTips: ConfigItem;
  order: Order = {
    _id: '',
    customer: null,
    selectedMenuItems: null,
    rawPrice: 0,
    tips: null,
    taxes: null,
    subTotalPrice: 0,
    status: 'INIT',
    totalPrice: 0,
    paymentMethod: '',
    collectionMethod: '',
    history: null
  };


  constructor(
    private menuService: MenuService,
    private orderService: OrderService,
    private restaurantService: RestaurantService,
    private  userService: UserService,
    private navigationService: NavigationService,
    private modalCtrl: ModalController,
    private router: Router
    ) { }

  ngOnInit() {

    this.userService.user$
    .subscribe(user => this.currentUser = user );

    this.menSub = this.menuService.selectedMenuItems$
      .subscribe( selectedItems => {
        console.log('ShoppingCart selectedItems', selectedItems);
        this.selectedMenuItems = selectedItems;
        this.subTotal = this.getSubtotal();
        console.log('step1');
        this.grandTotal = this.getGrandTotal_UpdateTipsTaxes();
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
          //this.selectedTips.floatValue = Math.round(this.subTotal * (tip.intValue)) / 100;
          console.log('in Test', this.selectedTips);
          this.grandTotal = this.getGrandTotal_UpdateTipsTaxes();
        }

      });

    this.restaurantService.getTaxList()
      .subscribe( taxList => {
        this.taxList = taxList;
        this.grandTotal = this.getGrandTotal_UpdateTipsTaxes();
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

  getGrandTotal_UpdateTipsTaxes() {
    console.log('getGrandTotal1');

    this.taxList.forEach(tax => {
      tax.amount = Math.round(this.subTotal  * tax.floatValue) / 100;
    });
    let price = 0;
    // add tips price
    if (this.selectedTips)
    {
      this.selectedTips.amount = Math.round(this.subTotal * (this.selectedTips.intValue)) / 100;
      console.log('getGrandTotal2', this.selectedTips.intValue);
      price = Math.round(this.subTotal * (100 + this.selectedTips.intValue)) / 100;
    }
    // add taxes price
    this.taxList.forEach(tax => {
      price += tax.amount;
    });

    console.log('selectedTips', this.selectedTips);

    return Math.round(price * 100) / 100;
    //return this.subTotal / 100;
  }

  onAddTips(tip: ConfigItem) {
    console.log('onAddTips', tip);
    this.clearChipSelection();
    this.selectedTips = tip;
    this.selectedTips.floatValue = Math.round(this.subTotal * (tip.intValue)) / 100;
    tip.selected = true;
    this.grandTotal = this.getGrandTotal_UpdateTipsTaxes();
  }

  clearChipSelection() {
    this.tipsList.forEach(tip => tip.selected = false);
  }

  onCheckoutStep() {
    this.checkoutStep = !this.checkoutStep;
    this.headerTitle = 'Checkout';
    //this.navigationService.setNavLink('Checkout');
  }

  onSeeSubTotalDetails() {
    this.seeSubTotalDetails = !this.seeSubTotalDetails;
  }

  onChangeCollectingMethod(ev: any) {
    console.log('Segment changed', ev.detail.value);
    this.selectedCollectionMethod = ev.detail.value;
    this.userService.updateUser({...this.currentUser});
  }

onCheckout() {
  
  this.order.selectedMenuItems = JSON.parse(JSON.stringify(this.selectedMenuItems));
  this.order.tips = JSON.parse(JSON.stringify(this.selectedTips));
  this.order.taxes = JSON.parse(JSON.stringify(this.taxList));
  this.order.totalPrice = this.grandTotal;
  this.order.subTotalPrice = this.subTotal;
  this.order.status = 'ITEMS SELECTED';
  //this.order.history = [null];
  this.order.history = [{action: 'ITEMS SELECTED', date: new Date()}];
  console.log('onCheckout()', this.order);
  this.orderService.CurrentOrder = this.order;
  this.menuService.clearSelectedMenuItems();
  console.log('flo');
  this.router.navigate(['tabs/order']);
}

}
