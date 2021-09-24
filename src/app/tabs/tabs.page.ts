import { Component, OnInit, OnDestroy } from "@angular/core";
import { MenuService } from "./../services/menu.service";
import { StaffService } from "./../services/staff.service";
import { SocketService } from "./../services/socket.service";
import { DriverService } from "./../services/driver.service";
import { OrderService } from "./../services/order.service";
import { ModalController } from "@ionic/angular";
import {
  RestaurantService,
  CurrentSlot,
} from "./../services/restaurant.service";
import { User } from "./../models/user.model";
import { Order } from "./../models/order.model";
import { AuthService } from "../services/auth.service";
import { NavigationService } from "./../services/navigation.service";
import { Subscription } from "rxjs";
import { switchMap, map, tap } from "rxjs/operators";
import { AccountPopupPage } from "./../shared-components/account-popup/account-popup.page";
import { PopoverController } from "@ionic/angular";
import { OrderDetailsPage } from "../shared-components/order-details/order-details.page";
import { Router } from "@angular/router";

// interface DriverOrder {
//   order: Order;
//   message: string;
// }

@Component({
  selector: "app-tabs",
  templateUrl: "./tabs.page.html",
  styleUrls: ["./tabs.page.scss"],
})
export class TabsPage implements OnInit, OnDestroy {
  selectedItemsCount = 0;
  selectedMenuItems: any;
  staffOrders: Order[] = [];
  userOrders: Order[] = [];
  labelCode = "";
  user: User;
  currentSlot: CurrentSlot = {
    isOpen: false,
    openHour: new Date(),
    closeHour: new Date(),
  };
  driverQuestion = false;
  driverOrders: Order[] = [];
  private menSub: Subscription;
  private authSub: Subscription;
  private navSub: Subscription;
  private staffOrdersSub: Subscription;
  private userOrdersSub: Subscription;
  private socketStaffOrderSub: Subscription;
  private socketDriverOrderSub: Subscription;
  private driverOrdersSub: Subscription;
  private driverInitOrderSub: Subscription;

  constructor(
    private menuService: MenuService,
    private navigationService: NavigationService,
    private authService: AuthService,
    private staffService: StaffService,
    private driverService: DriverService,
    private socketService: SocketService,
    private orderService: OrderService,
    private restaurantService: RestaurantService,
    private popoverCtrl: PopoverController,
    private modalCtrl: ModalController,
    public router: Router
  ) {}

  ngOnInit() {
    console.log("TabsPage");
    this.navSub = this.navigationService.getNavListener().subscribe((link) => {
      console.log("getNavListener", link);
      this.labelCode = link;
      // this.translationService.getTranslation(link).subscribe((label) => {
      //   this.topTitle = label;
      // });
    });

    this.menSub = this.menuService.selectedMenuItems$.subscribe(
      (selectedItems) => {
        console.log("Tabs selectedItems", selectedItems);
        this.selectedMenuItems = selectedItems;
      }
    );

    ////// role handling for order and listener
    // staff: listen staff orders only
    // admin: listen staff orders and personal orders
    // user and visitor: listen personal order

    this.authSub = this.authService
      .fetchUser("ouech.ouech@ouech.com")
      .pipe(
        switchMap((user) => {
          // this.user = user;
          return this.authService.user$;
        })
        // ,
        // switchMap(user => {
        //   return this.authService.logout();

        // })
      )
      .subscribe((user) => {
        this.emptyLists();
        this.user = user;
        this.unsubscribeRolesObservables();
        if (this.user.role === "USER" || this.user.role === "ADMIN") {
          this.userOrdersSub = this.orderService
            .fetchOrders(this.user._id)
            .pipe(switchMap((data) => this.orderService.orders$))
            .subscribe((userOrders) => {
              console.log("Tabs in UserOrders$", userOrders);
              this.userOrders = userOrders;
            });
        }
        if (this.user.role === "STAFF" || this.user.role === "ADMIN") {
          console.log("in STAFF condition");
          this.staffOrdersSub = this.staffService
            .fetchAllOrders()
            .pipe(
              switchMap((data) => this.staffService.orders$),
              map((staffOrders) =>
                staffOrders.filter((o) => o.finished === false)
              )
            )
            .subscribe((staffOrders) => {
              console.log("Tabs in Stafforders$");
              this.staffOrders = staffOrders;
            });

          this.socketStaffOrderSub = this.socketService
            .getMessages("STAFF_ORDER")
            .subscribe((socketData) => {
              console.log("socket", socketData);

              if (socketData.action === "UPDATE") {
                this.staffService.updateOrderLocally(socketData.order as Order);
              } else if (socketData.action === "CREATE") {
                this.staffService
                  .addOrderLocally(socketData.order as Order)
                  .subscribe((result) => console.log(result));
              }
            });
        }
        if (this.user.role === "DRIVER" || this.user.role === "ADMIN") {
          console.log("Driver socket");
          let currentDriver;
          this.driverInitOrderSub = this.driverService
            .fetchDriver(this.user._id)
            .pipe(
              switchMap((driver) => {
                currentDriver = driver;
                return this.driverService.getDriverOrders(driver._id);
              })
            )
            .subscribe((orders) => {
              console.log("Driver socket order1", orders);
              this.driverOrders = orders !== null ? orders : this.driverOrders;
              console.log("Driver socket order2", this.driverOrders);
            });

          this.driverService
            .fetchDriver(this.user._id)
            .pipe(
              switchMap((driver) => {
                currentDriver = driver;
                return this.socketService.getMessages(driver._id);
              })
            )
            .subscribe((socketData) => {
              console.log("socket DRIVER", socketData);
              this.driverService
                .fetchDriverOrders_afterReset(currentDriver._id)
                .subscribe();
              // if (socketData.action === 'DRIVER_ASK') {

              //   console.log('Driver socket order3', this.driverOrders);
              //   if ( this.driverOrders.findIndex(o => o._id === socketData.order._id) === -1) {

              //     this.driverService.addOrderLocally(socketData.order as Order);

              //   }
              // } else if (socketData.action === 'DRIVER_ASSIGN') {

              //   this.driverService.updateOrderLocally(socketData.order as Order);
              // } else if (socketData.action === 'DRIVER_PENDING_UNASSIGN') {
              //   this.driverService.removeOrderLocally(socketData.order as Order);
              // }
            });

          this.driverOrdersSub = this.driverService.orders$.subscribe(
            (orders) => {
              console.log("Driver orders");
              this.driverOrders = orders;
            }
          );
        }
      });

    this.restaurantService.fetchRestaurant().subscribe((restaurant) => {
      const today = new Date();
      // today.setHours(today.getHours() + 4);
      this.currentSlot = this.restaurantService.checkIfOpen(today);
    });
  }

  unsubscribeRolesObservables() {
    console.log("unsubscribeRolesObservables");
    if (this.socketStaffOrderSub) {
      this.socketStaffOrderSub.unsubscribe();
    }
    if (this.staffOrdersSub) {
      this.staffOrdersSub.unsubscribe();
    }
    if (this.userOrdersSub) {
      this.userOrdersSub.unsubscribe();
    }
    if (this.socketDriverOrderSub) {
      this.socketDriverOrderSub.unsubscribe();
    }
    if (this.driverOrdersSub) {
      this.driverOrdersSub.unsubscribe();
    }
    if (this.driverInitOrderSub) {
      this.driverInitOrderSub.unsubscribe();
    }
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
    if (this.navSub) {
      this.navSub.unsubscribe();
    }
    if (this.menSub) {
      this.menSub.unsubscribe();
    }
  }

  async presentAccountPopover(ev: any) {
    console.log("presentPopover");
    this.router.navigate(["tabs/login"]);
    // const popover = await this.popoverCtrl.create({
    //   component: AccountPopupPage,
    //   event: ev,
    //   translucent: true,
    // });
    // popover.style.cssText = '--min-width: 120px; --max-width: 140px;';
    // return await popover.present();
  }

  async onClickQuestionOrder(orderId: string) {
    console.log("onClickOrder", orderId);
    // clear pending list
    // this.driverOrders = this.driverOrders.filter(o => {
    //   console.log('o', o._id);
    //   return o._id !== orderId;
    // });
    console.log("presentModal");
    const modal = await this.modalCtrl.create({
      component: OrderDetailsPage,
      componentProps: {
        orderId,
      },
    });

    modal.onDidDismiss().then((data) => {});
    return await modal.present();
  }

  emptyLists() {
    this.driverOrders = [];
    this.staffOrders = [];
    this.userOrders = [];
  }
}
