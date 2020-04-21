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
  selectedItemsCount = 1;
  selectedOptionsCount = 1;
  totalPrice = 0;
  selectionCount = 0;
  selectedToppings: Topping[] = [];

  constructor(
    private menuService: MenuService,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    public toastCtrl: ToastController
  ) {
    this.menuItemId = navParams.get('menuItemId');
  }

  ngOnInit() {
    console.log('ngOnInit()');
    this.menuService.getOneMenuItem(this.menuItemId)
      .subscribe( item => {
        this.menuItem = item;
        this.totalPrice = item.price;
      },
      error => console.log(error)
      );
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
    this.totalPrice = this.totalPrice + this.menuItem.price;
  }

  onCounterRemove() {
    if ( this.menuItem.quantity >= 1 ) {
      this.menuItem.quantity--;
      this.totalPrice = this.totalPrice - this.menuItem.price;
    }
  }


  clearCheckboxes() {
    console.log('clearCheckboxes');
    this.menuItem.options[0].toppings.forEach(t => t.selected = false);
  }

  async onBoxChanged(checkbox: any, topping: Topping, option: Option) {
    console.log('onBoxChanged', checkbox.checked);
    console.log('filter selected el', option.toppings.filter( toppingEl => toppingEl.selected === true).length );


    if (checkbox.checked) {

      // if only 1 selection required, we clear all checkbox then activate this one. This way, we always have 1 selection.
      if ( option.exactNumber === 1) {
        this.clearCheckboxes();
      }




      // check if the exactNumber expected is smaller that the actual slected toppings
      if ( option.exactNumber <= option.toppings.filter( toppingEl => toppingEl.selected === true).length) {
        await this.presentToast('no possible, above ' + option.exactNumber + ' selections');
        return;
      }
      topping.selected = true;

    } else {
      console.log('in Unchecked event');
      topping.selected = false;

    }
    this.updatePrice();
  }

  updatePrice() {
    let toppingsPrice = 0;
    this.menuItem.options[0].toppings.forEach(t => {
      if (t.selected === true ) {
        toppingsPrice += t.price;
      }

    });
    this.totalPrice = (this.menuItem.price + toppingsPrice) * this.menuItem.quantity;
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2000
    });
    toast.present();
  }

  addToCart() {
    if (this.menuItem.quantity > 0 ) {
      console.log('adding SelectedMenuItem');
      this.menuService.addSelectedMenuItem(this.menuItem);
    }
  }

}
