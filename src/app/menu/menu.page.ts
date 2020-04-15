import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RestaurantService } from './../services/restaurant.service';
import { MenuService } from './../services/menu.service';
import { Restaurant } from './../models/restaurant.model';
import { MenuItem } from './../models/menuItem.model';
import { OpeningSlot } from './../models/openingSlot.model';
import { take, map, tap, delay, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { IonSlides, IonContent } from '@ionic/angular';


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
    slidesPerView: 2,
    autoplay: true
  };

  restaurant: Restaurant;
  menuItems: MenuItem[] = [];
  menuByCategories: Category[] = [];
  isRestaurantOpened = false;
  openingSlots: OpeningSlot[] = [];
  fullMenu: any[] = [];
  weekDays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  selectedImage: string;

  constructor( 
    private restaurantService: RestaurantService,
    public  menuService: MenuService,
    private httpClient: HttpClient
    ) { }

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
      today.setHours(today.getHours() + 4);
      this.isRestaurantOpened = this.restaurantService.checkIfOpen(today);
      
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
      this.isRestaurantOpened = this.restaurantService.checkIfOpen();
    });
  }

  convertHoursToDate(time: string) {
    // tslint:disable-next-line: radix
    const hour = parseInt(time.split(':')[0]);
    // tslint:disable-next-line: radix
    const minute = parseInt(time.split(':')[1]);
    new Date().setHours(hour, minute);
  }

checkIfOpen() {
    console.log('checkIfOpen');
    let isOpened = false;
    const today = new Date();
    const openingHour = new Date();
    const closingHour = new Date();
    const todayDay = this.weekDays[today.getDay()];
    console.log('todayDay', todayDay);
    const todaySlots = this.restaurant.openingHours.filter(t => t.day === todayDay);
    console.log('todaySlots', todaySlots);
    todaySlots.map( openingSlot =>

    
    // const openingSlot: OpeningSlot = this.openingSlots.find(t => {
    //   console.log('t', t);
    //   return t.day === todayDay;
    // } );
    {
      openingHour.setHours(
      +openingSlot.openTime.split(':')[0],
      +openingSlot.openTime.split(':')[1]
    );

      closingHour.setHours(
      +openingSlot.closeTime.split(':')[0],
      +openingSlot.closeTime.split(':')[1]
      );

      console.log('today', today);
      console.log('openingHour', openingHour);
      console.log('closingHour', closingHour);

      if (today >= openingHour && today <= closingHour) {
       console.log('in condition');
       isOpened = true;
    }
}
    );
    return isOpened;
  
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

}