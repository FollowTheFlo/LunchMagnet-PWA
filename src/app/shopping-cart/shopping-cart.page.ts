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
import { SocketService } from './../services/socket.service';
import { ModalController } from '@ionic/angular';
import { MenuItemPage } from './../shared-components/menu-item/menu-item.page';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Restaurant } from '../models/restaurant.model';
import { AddressSearchPage } from './../shared-components/address-search/address-search.page';
import { LoadingController } from '@ionic/angular';

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
  restaurant: Restaurant;
  selectedTips: ConfigItem;
  paymentMethodList: ConfigItem[] = [];
  selectedPaymentMethod: ConfigItem;
  


  constructor(
    private menuService: MenuService,
    private orderService: OrderService,
    private restaurantService: RestaurantService,
    private  userService: UserService,
    private navigationService: NavigationService,
    private socketService: SocketService,
    private modalCtrl: ModalController,
    private router: Router,
    private loadingCtrl: LoadingController,
    ) { }

  ngOnInit() {

    //  this.socketService.getMessages('')
    //  .subscribe(message => console.log('from socket', message));

    this.userService.user$
    .subscribe(user => {
      console.log('user$', user);
      this.currentUser = user;
    });

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

    this.restaurantService.getPaymentMethodsList()
    .subscribe( paymentMethods => {
      console.log('getPaymentMethodsList', paymentMethods);
      this.paymentMethodList = paymentMethods;

      this.paymentMethodList.forEach(pm => {
        if (pm.selected) {
          this.selectedPaymentMethod = pm;
        }
      });
    });

    this.restaurantService.fetchRestaurant()
    .subscribe(restaurant => {
      this.restaurant = restaurant;
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
    
    this.headerTitle = this.checkoutStep === true ? 'Checkout' : 'Shopping Cart';
    //this.navigationService.setNavLink('Checkout');
  }

  onSeeSubTotalDetails() {
    this.seeSubTotalDetails = !this.seeSubTotalDetails;
  }

  onChangeCollectingMethod(ev: any) {
    console.log('Segment changed', ev.detail.value);
    this.currentUser.collectionMethod = ev.detail.value;
    this.userService.updateUser({...this.currentUser});
   // this.paymentMethod = 'No Selection';
  }

  onSelectPaymentMethod(paymentMethod: ConfigItem) {
    console.log('paymentMethod', paymentMethod);
   // this.order.paymentMethod = paymentMethod.value;
    
  }

  async onOpenMap() {
    console.log('onOpenMap', this.restaurant);
    console.log('presentModal');
    const modal = await this.modalCtrl.create({
        component: AddressSearchPage,
        componentProps: {
          action: "SHOW",
          lat: this.restaurant.locationGeo.lat,
          lng: this.restaurant.locationGeo.lng,
          address: this.restaurant.address
        },

      });
   await modal.present();
    }

    async openSearchAddressModal() {
      console.log('presentModal');
      const modal = await this.modalCtrl.create({
        component: AddressSearchPage,

      });

      modal.onDidDismiss()
      .then((data) => {
        console.log(data);
        if ( data.data.action === 'save') {
          this.currentUser.deliveryAddress = data.data.address;
          this.userService.updateUser({...this.currentUser});
        }
      });
      return await modal.present();
    }

onCheckout() {

  //initiate empty order then filling it
  const order: Order = {
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
    history: null,
    selectedMenuItemsString: '',
    selectedItems: null,
    tipsString: '',
    taxesString: '',
    finished: false,
    createdAt: '',
    updatedAt: '',
    deliveryAddress: '',
    deliveryLocationGeo: { lat: 0, lng: 0},
    steps: null,
    currentStep: null,
    currentStepIndex: 0
  };
  
  order.selectedMenuItems = JSON.parse(JSON.stringify(this.selectedMenuItems));
  order.tips = JSON.parse(JSON.stringify(this.selectedTips));
  order.taxes = JSON.parse(JSON.stringify(this.taxList));
  order.totalPrice = this.grandTotal;
  order.subTotalPrice = this.subTotal;
  order.collectionMethod = this.currentUser.collectionMethod;
  order.paymentMethod = this.selectedPaymentMethod.code;
  order.status = 'ITEMS SELECTED';
  order.customer = {...this.currentUser};
  order.deliveryAddress = this.currentUser.deliveryAddress;
  order.deliveryLocationGeo = this.currentUser.deliveryLocationGeo;
  //this.order.history = [null];

  console.log('onCheckout()', order);
  //this.orderService.CurrentOrder = this.order;
  //this.menuService.clearSelectedMenuItems();

  this.loadingCtrl.create({ keyboardClose: true, message: 'Creating the order...' }).then((loadingEl) => {
    loadingEl.present();

    this.orderService.createOrder(order)
    .subscribe( response => {
      console.log('Order created succesfully', response);

      // clear the Cart as the order has been succesfully created
      this.menuService.clearSelectedMenuItems();
      loadingEl.dismiss();
      this.router.navigate(['tabs/orders']);
    },
    error => {
      console.log(error);
      loadingEl.dismiss();
    }
    );

});
  console.log('flo');
  
}

onConfirmOrder() {
  console.log('onConfirmOrder');
  //this.socketService.sendMessage('Order has been sent');

  
}


}
