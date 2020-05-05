import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then((m) => m.TabsPageModule),
  },
  { path: 'home', redirectTo: 'tabs/home', pathMatch: 'full' },
  { path: 'menu', redirectTo: 'tabs/menu', pathMatch: 'full' },
  {
    path: 'shopping-cart',
    loadChildren: () => import('./shopping-cart/shopping-cart.module').then( m => m.ShoppingCartPageModule)
  },
  {
    path: 'orders',
    loadChildren: () => import('./orders/orders.module').then( m => m.OrdersPageModule)
  },
  {
    path: 'staff-orders',
    loadChildren: () => import('./staff/staff-orders/staff-orders.module').then( m => m.StaffOrdersPageModule)
  },
  {
    path: 'driver-orders',
    loadChildren: () => import('./driver/driver-orders/driver-orders.module').then( m => m.DriverOrdersPageModule)
  },


  // { path: 'home', redirectTo: 'tabs/home', pathMatch: 'full' },
  // {
  //   path: 'menu',
  //   loadChildren: () => import('./menu/menu.module').then( m => m.MenuPageModule)
  // },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
