import { Routes } from "@angular/router";

export const routes: Routes = [
  {
    path: "products",
    loadComponent: () =>
      import("./pages/products/products.page").then((m) => m.ProductsPage),
  },
  {
    path: "",
    redirectTo: "products",
    pathMatch: "full",
  },
  {
    path: "inventory",
    loadComponent: () =>
      import("./pages/inventory/inventory.page").then((m) => m.InventoryPage),
  },
  {
    path: "mants",
    loadComponent: () =>
      import("./pages/mants/mants.page").then((m) => m.MantsPage),
  },
  {
    path: "cart",
    loadComponent: () =>
      import("./pages/cart/cart.page").then((m) => m.CartPage),
  },
  {
    path: "mant/products",
    loadComponent: () =>
      import("./pages/mants/mant-products/mant-products.page").then(
        (m) => m.MantProductsPage
      ),
  },
  {
    path: "mant/prices",
    loadComponent: () =>
      import("./pages/mants/mant-prices/mant-prices.page").then(
        (m) => m.MantPricesPage
      ),
  },
  {
    path: "mant/units",
    loadComponent: () =>
      import("./pages/mants/mant-units/mant-units.page").then(
        (m) => m.MantUnitsPage
      ),
  },
  {
    path: "mant/categories",
    loadComponent: () =>
      import("./pages/mants/mant-categories/mant-categories.page").then(
        (m) => m.MantCategoriesPage
      ),
  },
  {
    path: "consults",
    loadComponent: () =>
      import("./pages/consults/consults.page").then((m) => m.ConsultsPage),
  },
  {
    path: "consults/sells/:id",
    loadComponent: () =>
      import("./pages/consults/sells/sells.page").then((m) => m.SellsPage),
  },
  {
    path: "cash-box",
    loadComponent: () =>
      import("./pages/cash-box/cash-box.page").then((m) => m.CashBoxPage),
  },
  {
    path: "config",
    loadComponent: () =>
      import("./pages/config/config.page").then((m) => m.ConfigPage),
  },
  {
    path: "inventory/products-purchase",
    loadComponent: () =>
      import("./pages/inventory/products-purchase/products-purchase.page").then(
        (m) => m.ProductsPurchasePage
      ),
  },
  {
    path: "inventory/check",
    loadComponent: () =>
      import("./pages/inventory/inventory-check/inventory-check.page").then(
        (m) => m.InventoryCheckPage
      ),
  },
  {
    path: "config/printer",
    loadComponent: () =>
      import("./pages/config/printer-config/printer-config-page.page").then(
        (m) => m.PrinterConfigPage
      ),
  },
  {
    path: "consults/product-income/:id",
    loadComponent: () =>
      import("./pages/consults/product-income/product-income.page").then(
        (m) => m.ProductIncomePage
      ),
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.page').then( m => m.OrdersPage)
  },
  {
    path: 'orders/detail/:id',
    loadComponent: () => import('./pages/orders/detail/detail.page').then( m => m.DetailPage)
  },
];
