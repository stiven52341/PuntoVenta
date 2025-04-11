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
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.page').then( m => m.CartPage)
  },
  {
    path: 'mant/products',
    loadComponent: () => import('./pages/mants/mant-products/mant-products.page').then( m => m.MantProductsPage)
  },
  {
    path: 'mant/prices',
    loadComponent: () => import('./pages/mants/mant-prices/mant-prices.page').then( m => m.MantPricesPage)
  },
  {
    path: 'mant/units',
    loadComponent: () => import('./pages/mants/mant-units/mant-units.page').then( m => m.MantUnitsPage)
  },
  {
    path: 'mant/categories',
    loadComponent: () => import('./pages/mants/mant-categories/mant-categories.page').then( m => m.MantCategoriesPage)
  },




];
