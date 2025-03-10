import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products.page').then((m) => m.ProductsPage),
  },
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full',
  },
  {
    path: 'inventory',
    loadComponent: () => import('./pages/inventory/inventory.page').then( m => m.InventoryPage)
  },
  {
    path: 'mants',
    loadComponent: () => import('./pages/mants/mants.page').then( m => m.MantsPage)
  },  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then( m => m.CartPage)
  },

];
