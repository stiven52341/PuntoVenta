import { EventEmitter, inject, Injectable } from '@angular/core';
import { LocalCategoriesService } from '../local/local-categories/local-categories.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { LocalCurrenciesService } from '../local/local-currencies/local-currencies.service';
import { LocalInventoryCheckService } from '../local/local-inventory-check/local-inventory-check.service';
import { LocalInventoryCheckDetailsService } from '../local/local-inventory-check-details/local-inventory-check-details.service';
import { LocalInventoryIncomeService } from '../local/local-inventory-income/local-inventory-income.service';
import { LocalInventoryIncomeDetailService } from '../local/local-inventory-income-detail/local-inventory-income-detail.service';
import { LocalProductsService } from '../local/local-products/local-products.service';
import { LocalProductCategoryService } from '../local/local-product-category/local-product-category.service';
import { LocalPurchaseService } from '../local/local-purchase/local-purchase.service';
import { LocalUnitsService } from '../local/local-units/local-units.service';
import { LocalUnitProductsService } from '../local/local-unit-products/local-unit-products.service';
import { States } from 'src/app/models/constants';
import { ApiCoreService, IEntity } from '../api/api-core/api-core.service';
import { CategoryService } from '../api/category/category.service';
import { CurrencyService } from '../api/currency/currency.service';
import { InventoryCheckService } from '../api/inventory-check/inventory-check.service';
import { InventoryCheckDetailService } from '../api/inventory-check-detail/inventory-check-detail.service';
import { InventoryIncomeService } from '../api/inventory-income/inventory-income.service';
import { InventoryIncomeDetailService } from '../api/inventory-income-detail/inventory-income-detail.service';
import { ProductService } from '../api/product/product.service';
import { ProductCategoryService } from '../api/product-category/product-category.service';
import { PurchaseService } from '../api/purchase/purchase.service';
import { UnitService } from '../api/unit/unit.service';
import { UnitProductService } from '../api/unit-product/unit-product.service';
import { FilesService } from '../files/files.service';
import { LocalCashBoxService } from '../local/local-cash-box/local-cash-box.service';
import { CashBoxService } from '../api/cash-box/cash-box.service';

@Injectable({
  providedIn: 'root',
})
export class GlobalService {
  //Local
  private _localCategories = inject(LocalCategoriesService);
  private _localCurrencies = inject(LocalCurrenciesService);
  private _localInventoryCheck = inject(LocalInventoryCheckService);
  private _localInventoryCheckDetails = inject(
    LocalInventoryCheckDetailsService
  );
  private _localInventoryIncome = inject(LocalInventoryIncomeService);
  private _localInventoryIncomeDetails = inject(
    LocalInventoryIncomeDetailService
  );
  private _localProducts = inject(LocalProductsService);
  private _localProductCategories = inject(LocalProductCategoryService);
  private _localPurchase = inject(LocalPurchaseService);
  private _localUnit = inject(LocalUnitsService);
  private _localUnitProduct = inject(LocalUnitProductsService);
  private _localCashbox = inject(LocalCashBoxService);

  //Api
  private _categories = inject(CategoryService);
  private _currencies = inject(CurrencyService);
  private _inventoryCheck = inject(InventoryCheckService);
  private _inventoryCheckDetail = inject(InventoryCheckDetailService);
  private _inventoryIncomes = inject(InventoryIncomeService);
  private _inventoyIncomeDetail = inject(InventoryIncomeDetailService);
  private _products = inject(ProductService);
  private _productCategories = inject(ProductCategoryService);
  private _purchases = inject(PurchaseService);
  private _unit = inject(UnitService);
  private _unitProduct = inject(UnitProductService);
  private _cashbox = inject(CashBoxService);

  //Other
  private _files = inject(FilesService);
  private update = new EventEmitter<void>();

  constructor() {}

  public async SyncData(): Promise<boolean> {
    const results = await firstValueFrom(
      forkJoin([
        this._localCategories.getAll(),
        this._localCurrencies.getAll(),
        this._localInventoryCheck.getAll(),
        this._localInventoryCheckDetails.getAll(),
        this._localInventoryIncome.getAll(),
        this._localInventoryIncomeDetails.getAll(),
        this._localProducts.getAll(),
        this._localProductCategories.getAll(),
        this._localPurchase.getAll(),
        this._localUnit.getAll(),
        this._localUnitProduct.getAll(),
        this._localCashbox.getAll(),
      ])
    );

    const categories = results[0].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );
    const currencies = results[1].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );
    const inventoryChecks = results[2].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );
    const inventoryCheckDetails = results[3].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );
    const inventoryIncomes = results[4].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );
    const inventoryIncomeDetails = results[5].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );
    const products = results[6].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );
    const productCategories = results[7].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );
    const purchases = results[8].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );
    const units = results[9].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );
    const unitProducts = results[10].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );

    const cashboxes = results[11].filter(
      (value) =>
        value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    );

    const promises: Array<Promise<any>> = [
      this.syncValues(categories, this._categories),
      this.syncValues(currencies, this._currencies),
      this.syncValues(inventoryChecks, this._inventoryCheck),
      this.syncValues(inventoryCheckDetails, this._inventoryCheckDetail),
      this.syncValues(inventoryIncomes, this._inventoryIncomes),
      this.syncValues(inventoryIncomeDetails, this._inventoyIncomeDetail),
      this.syncValues(products, this._products),
      this.syncValues(productCategories, this._productCategories),
      this.syncValues(purchases, this._purchases),
      this.syncValues(units, this._unit),
      this.syncValues(unitProducts, this._unitProduct),
      this.syncValues(cashboxes, this._cashbox),
    ];

    const result = await firstValueFrom(forkJoin(promises)).catch(
      async (err) => {
        const error = new Error(
          `Error resyncing the data: ${JSON.stringify(err)}`
        );
        console.log(error);
        await this._files.saveError(error, false);
        return undefined;
      }
    );

    return result ? true : false;
  }

  private async syncValues(
    values: Array<IEntity<any>>,
    service: ApiCoreService<IEntity<any>>
  ) {
    if (values.length == 0) return;

    for (const value of values) {
      switch (value.uploaded) {
        case States.NOT_INSERTED:
          await service.insert(value);
          break;
        case States.NOT_UPDATED:
          service.update(value);
          break;
        case States.NOT_DELETED:
          service.delete(value);
          break;
        default:
          throw new Error('State not valid');
      }
    }
  }

  public updateData() {
    this.update.emit();
  }

  public listenToChanges() {
    return this.update.asObservable();
  }
}
