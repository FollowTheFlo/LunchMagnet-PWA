import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RestaurantService, CurrentSlot } from './../services/restaurant.service';
import { MenuService } from './../services/menu.service';
import { Restaurant } from './../models/restaurant.model';
import { MenuItem } from './../models/menuItem.model';
import { OpeningSlot } from './../models/openingSlot.model';
import { take, map, tap, delay, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { IonSlides, IonContent } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { AddressSearchPage } from './../shared-components/address-search/address-search.page';


interface Category {
  name: string;
  value: string;
  index: number;
  field1: string;
  field2: string;
  menuItems: MenuItem[];
}




@Component({
  selector: 'app-menu',
  templateUrl: './menu.page.html',
  styleUrls: ['./menu.page.scss'],
})
export class MenuPage implements OnInit {
  @ViewChild('filePicker', { static: false}) filePicker: ElementRef<HTMLInputElement>;
  //@ViewChild('categorySlides') slideWithNav: IonSlides;
  @ViewChild('content') content: IonContent;

  slideOpts = {
    initialSlide: 0,
    slidesPerView: 3,
    autoplay: false
  };
  userAddress = undefined;
  restaurant: Restaurant;
  menuItems: MenuItem[] = [];
  menuByCategories: Category[] = [];
  currentSlot: CurrentSlot;
  openingSlots: OpeningSlot[] = [];
  fullMenu: any[] = [];
  weekDays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  selectedImage: string;

  constructor(
    private restaurantService: RestaurantService,
    public  menuService: MenuService,
    private httpClient: HttpClient,
    private modalCtrl: ModalController
    ) { }


    async openSearchAddressModal() {
      console.log('presentModal');
      const modal = await this.modalCtrl.create({
        component: AddressSearchPage,

      });
      
      modal.onDidDismiss()
      .then((data) => {
        console.log(data);
        if ( data.data.action === 'save') {
          this.userAddress = data.data.address;
        }
      });
      return await modal.present();
    }

    scrollTo(elementId: string) {
      console.log('elementId',elementId);
      //elementId = 'Appetizers';
      const y = document.getElementById(elementId).offsetTop;
      this.content.scrollToPoint(0, y, 300);
  }

  ngOnInit() {
    console.log('MenuPage ngOnInit');
    this.restaurantService.fetchRestaurant()
    .subscribe(restaurant => {
      this.restaurant = restaurant;
      const today = new Date();
      //today.setHours(today.getHours() + 4);
      this.currentSlot = this.restaurantService.checkIfOpen(today);
      
    });

    this.menuService.fetchMenuItems()
    .subscribe( menuItems => {
      this.menuItems = menuItems;
      this.menuService.getCategories();
    });

    //sortMethod eith 'index' or 'value'
    this.menuService.getConfigItems('MENU_CATEGORY', 'index')
    .subscribe(categories => {
      this.menuByCategories = categories;
      // console.log('this.menuCategories1', thBy);
      // thBy.sort((a: Category, b: Category) => {
      //   return (a.index > b.index) ? 1 : -1;
      // });
      console.log('this.menuItems', this.menuItems);

      this.menuByCategories.forEach(menuCategory => {
        menuCategory.menuItems = this.menuItems.filter(menuItems => menuItems.category === menuCategory.value ) ;
       
      });
      console.log('this.menuCategories3', this.menuByCategories);
    });
   
  }

  reload() {
    this.restaurantService.fetchRestaurant()
    // .pipe(
    //   tap( r => this.checkIfOpen())
    // )

    .subscribe(restaurant => {
      this.restaurant = restaurant;
      this.currentSlot = this.restaurantService.checkIfOpen();
    });
  }

  convertHoursToDate(time: string) {
    // tslint:disable-next-line: radix
    const hour = parseInt(time.split(':')[0]);
    // tslint:disable-next-line: radix
    const minute = parseInt(time.split(':')[1]);
    new Date().setHours(hour, minute);
  }


  imageSelected(files: FileList) {
    console.log('imageSelected', files);
    if(!files || files.length === 0) {
      console.log('no file selected');
      return false;
    }
    this.menuService.uploadImage(files)
    .subscribe((val) => {
    
      console.log(val);
      },
      error => {
          console.log(error);
      }
      );

  }

  onChangeCollectingMethod(ev: any) {
    console.log('Segment changed', ev.detail.value);
  }

}