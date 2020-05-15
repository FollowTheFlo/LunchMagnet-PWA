import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: () => import('../home/home.module').then((m) => m.HomePageModule),
          },
        ],
      },
      {
        path: 'orders',
        children: [
          {
            path: '',
            loadChildren: () => import('../orders/orders.module').then((m) => m.OrdersPageModule),
          },
        ],
      },
      {
        path: 'order',
        children: [
          {
            path: '',
            loadChildren: () => import('../order/order.module').then((m) => m.OrderPageModule),
          },
        ],
      },
      {
        path: 'menu',
        children: [
          {
            path: '',
            loadChildren: () => import('../menu/menu.module').then((m) => m.MenuPageModule),
          },
        ],
      },
      {
        path: 'shopping-cart',
        children: [
          {
            path: '',
            loadChildren: () => import('../shopping-cart/shopping-cart.module').then((m) => m.ShoppingCartPageModule),
          },
        ],
      },
      {
        path: 'staff-orders',
        children: [
          {
            path: '',
            loadChildren: () => import('../staff/staff-orders/staff-orders.module').then((m) => m.StaffOrdersPageModule),
          },
        ],
      },
      {
        path: 'staff-drivers',
        children: [
          {
            path: '',
            loadChildren: () => import('../staff/staff-drivers/staff-drivers.module').then((m) => m.StaffDriversPageModule),
          },
        ],
      },
      {
        path: 'driver-dashboard',
        children: [
          {
            path: '',
            loadChildren: () => import('../driver/driver-dashboard/driver-dashboard.module').then((m) => m.DriverDashboardPageModule),
          },
        ],
      },
      {
        path: 'driver-orders',
        children: [
          {
            path: '',
            loadChildren: () => import('../driver/driver-orders/driver-orders.module').then((m) => m.DriverOrdersPageModule),
          },
        ],
      },
      {
        path: 'admin-dashboard',
        children: [
          {
            path: '',
            loadChildren: () => import('../admin/admin-dashboard/admin-dashboard.module').then((m) => m.AdminDashboardPageModule),
          },
        ],
      },
      {
        path: 'login',
        children: [
          {
            path: '',
            loadChildren: () => import('../auth/login/login.module').then((m) => m.LoginPageModule),
          },
        ],
      },
     
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
