import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { StaffDriversPageRoutingModule } from './staff-drivers-routing.module';

import { StaffDriversPage } from './staff-drivers.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    StaffDriversPageRoutingModule
  ],
  declarations: [StaffDriversPage]
})
export class StaffDriversPageModule {}
