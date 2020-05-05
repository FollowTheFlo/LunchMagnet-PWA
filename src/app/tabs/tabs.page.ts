import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuService } from './../services/menu.service';
import { OrderService } from './../services/order.service';
import { User } from './../models/user.model';
import { UserService } from './../services/user.service';
import { NavigationService } from './../services/navigation.service';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {

  selectedItemsCount = 0;
  selectedMenuItems: any;
  orders: any = [];
  labelCode = '';
  user: User;
  private menSub: Subscription;
  private navSub: Subscription;

  constructor(
    private menuService: MenuService,
    private navigationService: NavigationService,
    private userService: UserService,
    private orderService: OrderService
    ) { }

  ngOnInit() {
    console.log('TabsPage');
    this.navSub = this.navigationService.getNavListener().subscribe((link) => {
      console.log('getNavListener', link);
      this.labelCode = link;
      // this.translationService.getTranslation(link).subscribe((label) => {
      //   this.topTitle = label;
      // });
    });

    this.menSub = this.menuService.selectedMenuItems$
      .subscribe( selectedItems => {
        console.log('Tabs selectedItems', selectedItems);
        this.selectedMenuItems = selectedItems;
      });

    this.userService.fetchUser('florent.letendre@gmail.com')
      .subscribe(user => {
        this.user = user;
      });

    // request list from server then setup the listener.
    // listener will be fired when fetching, so update DOM only in listener
    this.orderService.fetchOrders('').pipe(
      switchMap(data =>  this.orderService.orders$)
    )
    .subscribe(orders => {
      console.log('Tabs in orders$');
      this.orders = orders;
    });
  }

  ngOnDestroy() {
    if (this.menSub) {
      this.menSub.unsubscribe();
    }
  }

}
