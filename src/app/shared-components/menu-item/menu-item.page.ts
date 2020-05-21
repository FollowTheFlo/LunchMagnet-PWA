import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { MenuService } from './../../services/menu.service';
import { MenuItem } from 'src/app/models/menuItem.model';
import { Option } from 'src/app/models/option.model';
import { Topping } from 'src/app/models/topping.model';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-menu-item',
  templateUrl: './menu-item.page.html',
  styleUrls: ['./menu-item.page.scss'],
})
export class MenuItemPage implements OnInit {

  menuItem: MenuItem;
  menuItemId: string;
  itemIndex: number;
  selectedItemsCount = 1;
  selectedOptionsCount = 1;
  totalPrice = 0;
  selectionCount = 0;
  selectedToppings: Topping[] = [];
  isLoading = true;
  action = 'add';

  constructor(
    private menuService: MenuService,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    public toastCtrl: ToastController
  ) {
    this.action = navParams.get('action');
    this.menuItemId = navParams.get('menuItemId');
    this.itemIndex = navParams.get('itemIndex');
  }

  ngOnInit() {
    console.log('ngOnInit() action', this.action);
    if( this.action === 'add') {


    this.menuService.getOneMenuItem(this.menuItemId)
      .subscribe( item => {
        this.menuItem = item;
        this.isLoading = false;
        // fill selection count to incliude the default selected toppings

        this.menuItem.options.forEach( option => {
          option.selectionCount = this.updateOptionSelectionCount(option);
        });

        this.updatePrice();
      },
      error => console.log(error)
      );
    } else {
      // edit the item using the index
      this.menuService.getOneSelectedItem(this.itemIndex)
      .subscribe( item => {
        this.menuItem = item;
        this.isLoading = false;
        // fill selection count to incliude the deault slected toppings

        this.menuItem.options.forEach( option => {
          option.selectionCount = this.updateOptionSelectionCount(option);
        });

        this.updatePrice();
      },
      error => console.log(error)
      );
    }
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter()');
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave()');
    // if (this.menuItem.quantity > 0 ) {
    //   console.log('adding SelectedMenuItem');
    //   this.menuService.addSelectedMenuItem(this.menuItem);
    // }

  }

  onCounterAdd() {
    this.menuItem.quantity++;
    this.updatePrice();
  }

  onCounterRemove() {
    if ( this.menuItem.quantity >= 1 ) {
      this.menuItem.quantity--;
      this.menuItem.totalPrice -= this.menuItem.price;
    }
    this.updatePrice();
  }


  clearCheckboxes( option: Option) {
    console.log('clearCheckboxes');
    option.toppings.forEach(t => t.selected = false);
  }

  updateOptionSelectionCount(option: Option) {
    return option.toppings.filter( toppingEl => toppingEl.selected === true).length;
  }

  async onBoxChanged(checkbox: any, topping: Topping, option: Option) {
    console.log('onBoxChanged', checkbox.checked);
    console.log('filter selected el', option.toppings.filter( toppingEl => toppingEl.selected === true).length );


    if (checkbox.checked) {


      // if only 1 selection required, we clear all checkbox then activate this one. This way, we always have 1 selection.
      if ( option.exactNumber === 1) {
        this.clearCheckboxes(option);
      }

      //filtering for exact Number and max number of selection
      //first get the actual slected Item count to compare
      const selectedCount = option.toppings.filter( toppingEl => toppingEl.selected === true).length;

      // check if the exactNumber expected is smaller that the actual slected toppings
      if ( option.exactNumber !== undefined && option.exactNumber !== 0 && option.exactNumber <= selectedCount) {

        await this.presentToast('Not possible: ' + option.exactNumber + ' selections required');
        // uncheck the box in DOM as choice not possible
        checkbox.checked = false;
        return;
      }

      if (option.max  !== null && option.max  !== 0 && option.max <= selectedCount) {
        await this.presentToast('Not possible: ' + option.max + ' selections maximum');
        // uncheck the box in DOM as choice not possible
        checkbox.checked = false;
        return;
      }

      console.log('option.selectionCount++');
      topping.selected = true;


    } else {
      console.log('in Unchecked event');
      console.log('option.selectionCount--');
      topping.selected = false;


    }
    option.selectionCount = this.updateOptionSelectionCount(option);
    this.updatePrice();
  }

  updatePrice() {
    let toppingsPrice = 0;
    if ( this.menuItem.options.length > 0) {

      this.menuItem.options.forEach(option => {
        option.toppings.forEach(t => {
          if (t.selected === true ) {
            toppingsPrice += t.price;
          }

        });
      });


  }
    this.menuItem.totalPrice = this.getTotalItemPrice(this.menuItem);
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1000,
      position: 'middle',
      color: 'medium',
      cssClass: 'toast',
      animated: true
    });
    toast.present();
  }

  async closeModal() {
    console.log('closeModal');
    //await this.toastCtrl.dismiss();
    const modal = await this.modalCtrl.getTop();
    modal.dismiss();
  }

  async addToCart() {
    if (this.menuItem.quantity > 0 ) {
      console.log('adding SelectedMenuItem');
      this.menuService.addSelectedMenuItem(this.menuItem);

      const modal = await this.modalCtrl.getTop();
      modal.dismiss();
    }
  }

  async editSelectedItem() {
    console.log('editSelectedItem');

    if (this.menuItem.quantity > 0 ) {
      console.log('editing SelectedMenuItem');
      this.menuService.editSelectedMenuItem(this.itemIndex, {...this.menuItem});

      const modal = await this.modalCtrl.getTop();
      modal.dismiss();
    }

  }

  async removeSelectedItem() {
    console.log('editSelectedItem');

    if (this.menuItem.quantity === 0 ) {
      console.log('editing SelectedMenuItem');
      this.menuService.removeSelectedMenuItem(this.itemIndex);

      const modal = await this.modalCtrl.getTop();
      modal.dismiss();
    }

  }


  getTotalItemPrice(item: MenuItem) {
    let totalItemPrice = item.price * 100;

    // collect price of toppings that belong to Options
    item.options.forEach( option => {
      if(option.toppings) {

        option.toppings.forEach( topping => {
          if (topping.selected === true) {
            totalItemPrice += (topping.price * 100);
          }
        });
     }
    });

    // multiply by number of items
    totalItemPrice = totalItemPrice * item.quantity;
    totalItemPrice /= 100;
    console.log('getTotalItemPrice2', totalItemPrice);
    return totalItemPrice;
  }


}
