export enum ApiKeys {
  PATH = 'http://192.168.44.189:8080/',
  PRODUCTS = PATH + 'products',
  CATEGORIES = PATH + 'categories',
  CURRENCIES = PATH + 'currencies',
  IMAGE_PRODUCTS = PATH + 'image-products',
  INVENTORY_CHECKS = PATH + 'inventory-checks',
  INVENTORY_CHECK_DETAILS = PATH + 'inventory-check-details',
  INVENTORY_INCOMES = PATH + 'inventory-incomes',
  INVENTORY_INCOME_DETAILS = PATH + 'inventory-income-details',
  UNITS = PATH + 'units',
  UNIT_PRODUCTS = PATH + 'unit-products',
  IMAGE_CATEGORIES = PATH + 'image-categories'
}

export enum StorageKeys{
  PRODUCTS = 'products',
  CATEGORIES = 'categories',
  CURRENCIES = 'currencies',
  INVENTORY_CHECKS = 'inventory-checks',
  INVENTORY_CHECK_DETAILS = 'inventory-check-details',
  INVENTORY_INCOMES = 'inventory-incomes',
  INVENTORY_INCOME_DETAILS = 'inventory-income-details',
  UNITS = 'units',
  UNIT_PRODUCTS = 'unit-products',
  GENERAL_INFO = 'general-info',
  CART = 'cart'
}

export enum PhotoKeys{
  PRODUCTS_ALBUMN = 'products',
  CATEGORIES_ALBUM = 'categories'
}
