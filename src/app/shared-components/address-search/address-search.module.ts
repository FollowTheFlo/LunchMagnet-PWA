import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';

import { AddressSearchPageRoutingModule } from './address-search-routing.module';

import { AddressSearchPage } from './address-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddressSearchPageRoutingModule,
    
  ],
  declarations: [AddressSearchPage]
})
export class AddressSearchPageModule {}
