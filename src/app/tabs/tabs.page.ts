import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuService } from './../services/menu.service';
import { StaffService } from './../services/staff.service';
import { SocketService } from './../services/socket.service';
import { OrderService } from './../services/order.service';
import { User } from './../models/user.model';
import { Order } from './../models/order.model';
import { UserService } from './../services/user.service';
import { NavigationService } from './../services/navigation.service';
import { Subscription } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
})
export class TabsPage implements OnInit, OnDestroy {

  selectedItemsCount = 0;
  selectedMenuItems: any;
  staffOrders: Order[] = [];
  userOrders: Order[] = [];
  labelCode = '';
  user: User;
  private menSub: Subscription;
  private navSub: Subscription;
  private socketStaffOrderSub: Subscription;

  constructor(
    private menuService: MenuService,
    private navigationService: NavigationService,
    private userService: UserService,
    private staffService: StaffService,
    private socketService: SocketService,
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

    this.userService.fetchUser('florent.letendre@gmail.com').pipe(
      switchMap(user => {
        this.user = user;
        return this.orderService.fetchOrders(user._id);
      }),
      switchMap(data =>  this.orderService.orders$),
      map(userOrders => userOrders.filter(o => o.finished === false))
    )
    .subscribe(userOrders => {
      console.log('Tabs in UserOrders$',userOrders);
      this.userOrders = userOrders;
    });
      // .subscribe(user => {
      //   this.user = user;
      // });

    // request list from server then setup the listener.
    // listener will be fired when fetching, so update DOM only in listener
    this.staffService.fetchAllOrders().pipe(
      switchMap(data =>  this.staffService.orders$),
      map(staffOrders => staffOrders.filter(o => o.finished === false))
    )
    .subscribe(staffOrders => {
      console.log('Tabs in Stafforders$');
      this.staffOrders = staffOrders;
    });

    this.socketStaffOrderSub = this.socketService.getMessages('STAFF_ORDER')
          .subscribe(socketData => {

            console.log('socket', socketData );

            if (socketData.action === 'UPDATE') {
                this.staffService.updateOrderLocally(socketData.order as Order);
            } else
            if (socketData.action === 'CREATE') {
              this.staffService.addOrderLocally(socketData.order as Order)
              .subscribe(result => console.log(result));
            }

         });
  }

  ngOnDestroy() {
    if (this.menSub) {
      this.menSub.unsubscribe();
    }
    if (this.navSub) {
      this.navSub.unsubscribe();
    }
    if (this.socketStaffOrderSub) {
      this.socketStaffOrderSub.unsubscribe();
    }
  }

}
