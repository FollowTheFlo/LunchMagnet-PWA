
import { Component, OnInit } from '@angular/core';
import { ConfigItem } from './../models/configItem.model';
import { RestaurantService } from './../services/restaurant.service';
import { OrderService } from './../services/order.service';
import { Order } from '../models/order.model';

@Component({
  selector: 'app-order',
  templateUrl: './order.page.html',
  styleUrls: ['./order.page.scss'],
})
export class OrderPage implements OnInit {

  subTotal = 0;
  grandTotal = 0;
  tipsList: ConfigItem[] = [];
  taxList: ConfigItem[] = [];
  selectedTips: ConfigItem;
  selectedPaymentMethod: ConfigItem;
  paymentMethodList: ConfigItem[] = [];
  collectMethodList: ConfigItem[] = [];
  order: Order;

  constructor(
    private restaurantService: RestaurantService,
    private orderService: OrderService
    ) { }

  ngOnInit() {

    // this.orderService.currentOrder$
    // .subscribe( order => {
    //   console.log('currentOrder$', order );
    //   this.order = order;
    // });

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

    this.restaurantService.getCollectMethodsList()
    .subscribe( collectMethods => {
      console.log('getCollectMethodsList', collectMethods);
      this.collectMethodList = collectMethods;
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
        // this.selectedTips.floatValue = Math.round(this.subTotal * (tip.intValue)) / 100;
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

  getGrandTotal_UpdateTipsTaxes() {
    console.log('getGrandTotal1');

    this.taxList.forEach(tax => {
      tax.amount = Math.floor(this.subTotal  * tax.floatValue) / 100;
    });
    let price = 0;
    // add tips price
    if (this.selectedTips)
    {
      this.selectedTips.amount = Math.floor(this.subTotal * (this.selectedTips.intValue)) / 100;
      console.log('getGrandTotal2', this.selectedTips.intValue);
      price = Math.floor(this.subTotal * (100 + this.selectedTips.intValue)) / 100;
    }
    // add taxes price
    this.taxList.forEach(tax => {
      price += tax.amount;
    });

    console.log('selectedTips', this.selectedTips);

    return Math.floor(price * 100) / 100;
    //return this.subTotal / 100;
  }

  onAddTips(tip: ConfigItem) {
    console.log('onAddTips', tip);
    this.clearChipSelection();
    this.selectedTips = tip;
    this.selectedTips.floatValue = Math.floor(this.subTotal * (tip.intValue)) / 100;
    tip.selected = true;
    this.grandTotal = this.getGrandTotal_UpdateTipsTaxes();
  }

  clearChipSelection() {
    this.tipsList.forEach(tip => tip.selected = false);
  }


}
