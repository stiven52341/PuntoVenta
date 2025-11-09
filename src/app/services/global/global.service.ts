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
import { States } from 'src/app/services/constants';
import { ApiCoreService, IEntity } from '../api/api-core/api-core.service';
import { CategoryService } from '../api/category/category.service';
import { CurrencyService } from '../api/currency/currency.service';
import { InventoryCheckService } from '../api/inventory-check/inventory-check.service';
import { InventoryIncomeService } from '../api/inventory-income/inventory-income.service';
import { ProductService } from '../api/product/product.service';
import { ProductCategoryService } from '../api/product-category/product-category.service';
import { PurchaseService } from '../api/purchase/purchase.service';
import { UnitService } from '../api/unit/unit.service';
import { UnitProductService } from '../api/unit-product/unit-product.service';
import { FilesService } from '../files/files.service';
import { LocalCashBoxService } from '../local/local-cash-box/local-cash-box.service';
import { CashBoxService } from '../api/cash-box/cash-box.service';
import { LocalUnitBaseService } from '../local/local-unit-base/local-unit-base.service';
import { UnitBaseService } from '../api/unit-base/unit-base.service';
import { LocalPurchaseDetailService } from '../local/local-purchase-detail/local-purchase-detail.service';
import { InternalStorageCoreService } from '../local/internal-storage-core/internal-storage-core.service';
import { LocalBillInvoiceService } from '../local/local-bill-invoice/local-bill-invoice.service';
import { BillInvoiceService } from '../api/bill-invoice/bill-invoice.service';
import { LocalEmployeeService } from '../local/local-employee/local-employee.service';
import { EmployeeService } from '../api/employee/employee.service';

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
  private _localUnitBase = inject(LocalUnitBaseService);
  private _localPurchaseDetails = inject(LocalPurchaseDetailService);
  private _localInvoices = inject(LocalBillInvoiceService);
  private _localEmployees = inject(LocalEmployeeService);

  //Api
  private _categories = inject(CategoryService);
  private _currencies = inject(CurrencyService);
  private _inventoryCheck = inject(InventoryCheckService);
  private _inventoryIncomes = inject(InventoryIncomeService);
  private _products = inject(ProductService);
  private _productCategories = inject(ProductCategoryService);
  private _purchases = inject(PurchaseService);
  private _unit = inject(UnitService);
  private _unitProduct = inject(UnitProductService);
  private _cashbox = inject(CashBoxService);
  private _unitBase = inject(UnitBaseService);
  private _invoices = inject(BillInvoiceService);
  private _employees = inject(EmployeeService);

  //Other
  private _files = inject(FilesService);
  private update = new EventEmitter<void>();
  private updateOrdersEvt = new EventEmitter<void>();

  constructor() { }

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
        this._localUnitBase.getAll(),
        this._localPurchaseDetails.getAll(),
        this._localInvoices.getAll(),
        this._localEmployees.getAll()
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

    const unitBases = results[12].filter((value) => {
      return value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED
    });

    const purchasesDetails = results[13].filter((value) => {
      return value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED;
    });

    const invoices = results[14].filter(value => {
      return value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED;
    });

    const employees = results[15].filter(value => {
      return value.uploaded != States.SYNC && value.uploaded != States.DOWNLOADED;
    });

    for (const purchase of purchases) {
      purchase.details = purchasesDetails.filter(detail => {
        return +detail.id.idPurchase == +purchase.id
      });
    }

    for (const check of inventoryChecks) {
      check.details = inventoryCheckDetails.filter(detail => {
        return +detail.id.idInventoryCheck == +check.id
      });
    }

    for (const income of inventoryIncomes) {
      income.details = inventoryIncomeDetails.filter(detail => {
        return +detail.id.idInventoryIncome == +income.id
      });
    }

    //Most important values are synced first...
    await firstValueFrom(forkJoin([
      this.syncValues(categories, this._categories, this._localCategories),
      this.syncValues(currencies, this._currencies, this._localCurrencies),
      this.syncValues(products, this._products, this._localProducts),
      this.syncValues(units, this._unit, this._localUnit),
      this.syncValues(employees, this._employees, this._localEmployees)
    ])).catch(err => {
      this._files.saveError(err);
      return false;
    });

    //Then, 2nd dependencial data is synced
    await firstValueFrom(forkJoin([
      this.syncValues(unitProducts, this._unitProduct, this._localUnitProduct),
      this.syncValues(unitBases, this._unitBase, this._localUnitBase)
    ])).catch(err => {
      this._files.saveError(err);
      return false;
    });

    //At the end, most dependencional data is synced
    await firstValueFrom(forkJoin([
      this.syncValues(inventoryChecks, this._inventoryCheck, this._localInventoryCheck),
      this.syncValues(inventoryIncomes, this._inventoryIncomes, this._localInventoryIncome),
      this.syncValues(productCategories, this._productCategories, this._localProductCategories),
      this.syncValues(purchases, this._purchases, this._localPurchase),
      this.syncValues(cashboxes, this._cashbox, this._localCashbox),
      this.syncValues(invoices, this._invoices, this._localInvoices)
    ])).catch(err => {
      this._files.saveError(err);
      return false;
    });

    return true;
  }

  private async syncValues<T>(
    values: Array<IEntity<T>>,
    apiService: ApiCoreService<IEntity<T>>,
    localService: InternalStorageCoreService<IEntity<T>>
  ) {
    if (values.length == 0) return;

    for (const value of values) {
      switch (value.uploaded) {
        case States.NOT_INSERTED:
          await apiService.insert(value);
          break;
        case States.NOT_UPDATED:
          await apiService.update(value);
          break;
        case States.NOT_DELETED:
          await apiService.delete(value);
          break;
        default:
          throw new Error('State not valid');
      }
      value.uploaded = States.SYNC
      await localService.update(value);
    }
  }

  public updateOrders() {
    this.updateOrdersEvt.emit();
  }

  public listenToOrderUpdating() {
    return this.updateOrdersEvt.asObservable();
  }

  public updateData() {
    this.update.emit();
  }

  public listenToChanges() {
    return this.update.asObservable();
  }

  public async syncDataWithAPI() {
    try {
      await firstValueFrom(forkJoin([
        this._localUnitProduct.fixUnitProducts(),
        this._localPurchase.set([]),
        this._localPurchaseDetails.set([])
      ]));

      const oldData = await firstValueFrom(forkJoin([
        this._localCashbox.getAll(),
        this._localCategories.getAll(),
        this._localCurrencies.getAll(),
        this._localInventoryCheck.getAll(),
        this._localInventoryCheckDetails.getAll(),
        this._localInventoryIncome.getAll(),
        this._localInventoryIncomeDetails.getAll(),
        this._localProductCategories.getAll(),
        this._localProducts.getAll(),
        this._localPurchase.getAll(),
        this._localPurchaseDetails.getAll(),
        this._localUnit.getAll(),
        this._localUnitBase.getAll(),
        this._localUnitProduct.getAll()
      ]));

      const cashboxes = oldData[0].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const categories = oldData[1].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const currencies = oldData[2].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const inventoryChecks = oldData[3].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const inventoryChecksDs = oldData[4].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const inventoryIncome = oldData[5].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const inventoryIncomeDetails = oldData[6].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const productCategories = oldData[7].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const products = oldData[8].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const purchases = oldData[9].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const purchasesDs = oldData[10].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const units = oldData[11].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const unitBases = oldData[12].map(e => { e.uploaded = States.NOT_INSERTED; return e });
      const unitProductsDs = oldData[13].map(e => { e.uploaded = States.NOT_INSERTED; return e });

      await firstValueFrom(forkJoin([
        this._localCashbox.set(cashboxes),
        this._localCategories.set(categories),
        this._localCurrencies.set(currencies),
        this._localInventoryCheck.set(inventoryChecks),
        this._localInventoryCheckDetails.set(inventoryChecksDs),
        this._localInventoryIncome.set(inventoryIncome),
        this._localInventoryIncomeDetails.set(inventoryIncomeDetails),
        this._localProductCategories.set(productCategories),
        this._localProducts.set(products),
        this._localPurchase.set(purchases),
        this._localPurchaseDetails.set(purchasesDs),
        this._localUnit.set(units),
        this._localUnitBase.set(unitBases),
        this._localUnitProduct.set(unitProductsDs)
      ]));

      await this.SyncData();
    } catch (error) {
      throw error;
    }
  }
}
