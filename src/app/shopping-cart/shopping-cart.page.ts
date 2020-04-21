import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'src/app/models/menuItem.model';
import { MenuService } from './../services/menu.service';
import { NavigationService } from './../services/navigation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.page.html',
  styleUrls: ['./shopping-cart.page.scss'],
})
export class ShoppingCartPage implements OnInit, OnDestroy {

  private menSub: Subscription;
  selectedMenuItems: MenuItem[] = [];

  constructor(
    private menuService: MenuService,
    private navigationService: NavigationService
    ) { }

  ngOnInit() {
    this.menSub = this.menuService.selectedMenuItems$
      .subscribe( selectedItems => {
        console.log('Tabs selectedItems', selectedItems);
        this.selectedMenuItems = selectedItems;
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

}
