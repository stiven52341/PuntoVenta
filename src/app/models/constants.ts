export enum ApiKeys {
  // PATH = 'http://157.230.224.218:16000/',//Production
  PATH = 'http://10.40.137.96:8080/',
  PRODUCTS = PATH + 'products',
  CATEGORIES = PATH + 'categories',
  CURRENCIES = PATH + 'currencies',
  IMAGE_PRODUCTS = PATH + 'image-products',
  INVENTORY_CHECKS = PATH + 'inventory-checks',
  // INVENTORY_CHECK_DETAILS = PATH + 'inventory-check-details',
  INVENTORY_INCOMES = PATH + 'inventory-incomes',
  INVENTORY_INCOME_DETAILS = PATH + 'inventory-income-details',
  UNITS = PATH + 'units',
  UNIT_PRODUCTS = PATH + 'unit-products',
  IMAGE_CATEGORIES = PATH + 'image-categories',
  PRODUCT_CATEGORIES = PATH + 'product-categories',
  PURCHASE = PATH + 'purchases',
  CASH_BOX = PATH + 'cash-boxes',
  PRODUCT_PURCHASE = PATH + 'product-purchase',
  ERRORS = PATH + 'errors',
  UNIT_BASE = PATH + 'unit-base-products',
  INVENTORY = PATH + 'inventory'
}

export enum StorageKeys {
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
  CART = 'cart',
  PRODUCT_CATEGORIES = 'product-categories',
  PURCHASES = 'purchases',
  PURCHASES_DETAILS = 'purchases-details',
  CASH_BOXES = 'cash-boxes',
  PRODUCT_PURCHASE = 'product-purchase',
  PRINTER = 'printer',
  UNIT_BASE = 'unit-base-products'
}

export enum PhotoKeys {
  PRODUCTS_ALBUMN = 'products',
  CATEGORIES_ALBUM = 'categories',
}

export enum States {
  SYNC = 'sync',
  NOT_INSERTED = 'not-inserted',
  NOT_UPDATED = 'not-updated',
  NOT_DELETED = 'not-deleted',
  NOT_SYNCABLE = 'not-syncable',
  DOWNLOADED = 'downloaded'
}

export enum DirectoryKeys{
  ROOT = '/SellsPoint'
}

export enum FilesKeys{
  ERRORS = DirectoryKeys.ROOT + '/errors.txt'
}