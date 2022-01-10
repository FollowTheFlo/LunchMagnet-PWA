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
import { Subject, Subscription } from "rxjs";
import { switchMap, map, take, takeUntil } from "rxjs/operators";
import { PopoverController } from "@ionic/angular";
import { OrderDetailsPage } from "../shared-components/order-details/order-details.page";
import { Router } from "@angular/router";
import Utils from "../utils";
import { Driver } from "../models/driver.model";

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
  private destroy$ = new Subject<boolean>(); // unsbscibe observables in onDestroy Hook
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
    private modalCtrl: ModalController,
    public router: Router
  ) {}

  ngOnInit() {
    console.log("TabsPage");
    this.navigationService
      .getNavListener()
      .pipe(takeUntil(this.destroy$))
      .subscribe((link) => {
        console.log("getNavListener", link);
        this.labelCode = link;
      });

    this.menuService.selectedMenuItems$
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedItems) => {
        console.log("Tabs selectedItems", selectedItems);
        this.selectedMenuItems = selectedItems;
      });

    ////// role handling for order and listener
    // staff: listen staff orders only
    // admin: listen staff orders and personal orders
    // user and visitor: listen personal order

    this.authService
      .fetchUser("ouech.ouech@ouech.com")
      .pipe(
        switchMap((user) => {
          return this.authService.user$;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        this.emptyLists();
        this.user = user;
        this.unsubscribeRolesObservables();
        if (this.user.role === "USER" || this.user.role === "ADMIN") {
          this.setupUserOrders();
        }
        if (this.user.role === "STAFF" || this.user.role === "ADMIN") {
          console.log("in STAFF condition");
          this.setupStaffOrders();
        }
        if (this.user.role === "DRIVER" || this.user.role === "ADMIN") {
          console.log("Driver socket");
          this.setupDriverdata();
        }
      });

    this.restaurantService
      .fetchRestaurant()
      .pipe(take(1))
      .subscribe((restaurant) => {
        const today = new Date();
        // fetch restaurant data first to make sure restaurant class var is updated in restaurantService
        this.currentSlot = this.restaurantService.checkIfOpen(today);
      });
  }

  ngOnDestroy() {
    this.destroy$.next(true); // unsunscribe all observable that have takeUntil(destroy$)
    this.destroy$.complete();
    this.unsubscribeRolesObservables();
  }

  setupUserOrders() {
    this.userOrdersSub = this.orderService
      .fetchOrders(this.user._id)
      .pipe(switchMap((data) => this.orderService.orders$))
      .subscribe((userOrders: Order[]) => {
        console.log("Tabs in UserOrders$", userOrders);
        this.userOrders = Utils.deepCopyOrdersList(userOrders);
      });
  }

  setupStaffOrders() {
    this.staffOrdersSub = this.staffService
      .fetchAllOrders()
      .pipe(
        switchMap((success: boolean) => {
          console.log("fetchAllorders success", success);
          // staff order listener stream
          return this.staffService.orders$;
        }),
        map((staffOrders) => staffOrders.filter((o) => o.finished === false))
      )
      .subscribe((staffOrders) => {
        console.log("Tabs in Stafforders$");
        this.staffOrders = Utils.deepCopyOrdersList(staffOrders);
      });

    // setup socket listener
    this.socketStaffOrderSub = this.socketService
      .getMessages("STAFF_ORDER")
      .subscribe((socketData) => {
        console.log("socket", socketData);

        if (socketData.action === "UPDATE") {
          this.staffService.updateOrderLocally(socketData.order as Order);
        } else if (socketData.action === "CREATE") {
          this.staffService
            .addOrderLocally(socketData.order as Order)
            .pipe(take(1))
            .subscribe((result) => console.log(result));
        }
      });
  }

  setupDriverdata() {
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
        console.log("Driver  order1", orders);
        this.driverOrders = orders !== null ? orders : this.driverOrders;
        console.log("Driver  order2", this.driverOrders);
      });

    this.driverService
      .fetchDriver(this.user._id)
      .pipe(
        switchMap((driver: Driver) => {
          currentDriver = driver;
          return this.socketService.getMessages(driver._id);
        })
      )
      .subscribe((socketData) => {
        console.log("socket DRIVER", socketData);
        this.driverService
          .fetchDriverOrders_afterReset(currentDriver._id)
          .subscribe(); // no need to unsubscribe as take(1)
      });

    this.driverOrdersSub = this.driverService.orders$.subscribe((orders) => {
      console.log("Driver orders incoming", orders);
      this.driverOrders = Utils.deepCopyOrdersList(orders);
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
