import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePageRoutingModule } from './home-routing.module';
import { RouterModule } from '@angular/router';
import { HomePage } from './home.page';
import { AddressSearchPageModule} from '../shared-components/address-search/address-search.module';
import { MenuItemPageModule} from '../shared-components/menu-item/menu-item.module';


@NgModule({
  imports: [
   
    CommonModule,
    FormsModule,
    IonicModule,
    AddressSearchPageModule,
    HomePageRoutingModule,
    MenuItemPageModule
    
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
