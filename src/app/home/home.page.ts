import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RestaurantService, CurrentSlot } from './../services/restaurant.service';
import { MenuService } from './../services/menu.service';
import { NavigationService } from './../services/navigation.service';
import { Restaurant } from './../models/restaurant.model';
import { MenuItem } from './../models/menuItem.model';
import { MenuCategory } from './../models/menuCategory.model';
import { OpeningSlot } from './../models/openingSlot.model';
import { take, map, tap, delay, switchMap, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { IonSlides, IonContent, AngularDelegate } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { AddressSearchPage } from './../shared-components/address-search/address-search.page';
import { MenuItemPage } from './../shared-components/menu-item/menu-item.page';


interface MenuByCategory {
  _id: string;
  name: string;
  name_fr: string;
  description: string;
  description_fr: string;
  price: number;
  code: string;
  index: number;
  notes: string;
  active: boolean;
  imageUrl: string;
  menuItems: MenuItem[];
}

// interface CurrentSlot {
//   isOpen: boolean;
//   openHour: Date;
//   closeHour: Date;
// }


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
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
  menuByCategories: MenuByCategory[] = [];
  currentSlot: CurrentSlot = {
    isOpen: false,
    openHour: new Date(),
    closeHour: new Date()
  };
  openingSlots: OpeningSlot[] = [];
  fullMenu: any[] = [];
  weekDays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  selectedImage: string;

  constructor(
    private restaurantService: RestaurantService,
    private  menuService: MenuService,
    private httpClient: HttpClient,
    private modalCtrl: ModalController,
    private navigationService: NavigationService
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
      console.log('elementId', elementId);
      //elementId = 'Appetizers';
      //element.scrollIntoView({behavior: 'smooth'});
      const elmnt = document.getElementById(elementId);
      elmnt.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
      //const y = document.getElementById(elementId).offsetTop;
     // this.content.scrollToPoint(0, y, 300);
  }

  ionViewDidEnter() {
    this.navigationService.setNavLink('HOME');
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
    
          //sortMethod eith 'index' or 'name'
      this.menuService.fetchMenuCategories('index')
        .subscribe(categories => {
          this.menuByCategories = categories;
          // console.log('this.menuCategories1', thBy);
          // thBy.sort((a: Category, b: Category) => {
          //   return (a.index > b.index) ? 1 : -1;
          // });
          console.log('this.menuItems', this.menuItems);

          // in each category, add item list
          this.menuByCategories.forEach(menuCategory => {
            menuCategory.menuItems = this.menuItems.filter(mItems => mItems.category === menuCategory._id ) ;

          });
          console.log('this.menuCategories3', this.menuByCategories);
        });

    });



  }

  // reload() {
  //   this.restaurantService.fetchRestaurant()
  //   // .pipe(
  //   //   tap( r => this.checkIfOpen())
  //   // )

  //   .subscribe(restaurant => {
  //     this.restaurant = restaurant;
  //     this.currentSlot = this.restaurantService.checkIfOpen();
  //   });
  // }

  async onSelectItem(itemId: string) {
    console.log('onSelectItem', itemId);
    console.log('presentModal');
    const modal = await this.modalCtrl.create({
        component: MenuItemPage,
        componentProps: {
          menuItemId: itemId,
        },

      });
    modal.style.cssText = '--min-height: 120px; --max-height: 500px;';
 
    // modal.onDidDismiss()
    //   .then((data) => {
    //     console.log(data);
    //     if ( data.data.action === 'save') {
    //       this.userAddress = data.data.address;
    //     }
    //   });
    return await modal.present();
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