import { InventoryCheckService } from './../../../services/api/inventory-check/inventory-check.service';
import { Component, inject, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  ModalController,
} from '@ionic/angular/standalone';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PhotoKeys } from 'src/app/services/constants';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { CategoryService } from 'src/app/services/api/category/category.service';
import { CurrencyService } from 'src/app/services/api/currency/currency.service';
import { ImageCategoryService } from 'src/app/services/api/image-category/image-category.service';
import { ImageProductService } from 'src/app/services/api/image-product/image-product.service';
import { InventoryIncomeService } from 'src/app/services/api/inventory-income/inventory-income.service';
import { ProductCategoryService } from 'src/app/services/api/product-category/product-category.service';
import { ProductService } from 'src/app/services/api/product/product.service';
import { UnitProductService } from 'src/app/services/api/unit-product/unit-product.service';
import { UnitService } from 'src/app/services/api/unit/unit.service';
import { FilesService } from 'src/app/services/files/files.service';
import { GeneralInfoService } from 'src/app/services/local/general-info/general-info.service';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
import { LocalCurrenciesService } from 'src/app/services/local/local-currencies/local-currencies.service';
import { LocalInventoryCheckDetailsService } from 'src/app/services/local/local-inventory-check-details/local-inventory-check-details.service';
import { LocalInventoryCheckService } from 'src/app/services/local/local-inventory-check/local-inventory-check.service';
import { LocalInventoryIncomeDetailService } from 'src/app/services/local/local-inventory-income-detail/local-inventory-income-detail.service';
import { LocalInventoryIncomeService } from 'src/app/services/local/local-inventory-income/local-inventory-income.service';
import { LocalProductCategoryService } from 'src/app/services/local/local-product-category/local-product-category.service';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { PurchaseService } from 'src/app/services/api/purchase/purchase.service';
import { LocalPurchaseService } from 'src/app/services/local/local-purchase/local-purchase.service';
import { LocalPurchaseDetailService } from 'src/app/services/local/local-purchase-detail/local-purchase-detail.service';
import { IPurchase } from 'src/app/models/purchase.model';
import { IPurchaseDetail } from 'src/app/models/purchase-detail.model';
import { CashBoxService } from 'src/app/services/api/cash-box/cash-box.service';
import { LocalCashBoxService } from 'src/app/services/local/local-cash-box/local-cash-box.service';
import { ProductPurchaseService } from 'src/app/services/api/product-purchase/product-purchase.service';
import { LocalProductPurchaseService } from 'src/app/services/local/local-product-purchase/local-product-purchase.service';
import { IInventoryCheck } from 'src/app/models/inventory-check.model';
import { IInventoryCheckDetail } from 'src/app/models/inventory-check-detail.model';
import { IInventoryIncomeDetail } from 'src/app/models/inventory-income-detail.model';
import { IInventoryIncome } from 'src/app/models/inventory-income.model';
import { UnitBaseService } from 'src/app/services/api/unit-base/unit-base.service';
import { LocalUnitBaseService } from 'src/app/services/local/local-unit-base/local-unit-base.service';
import { InventoryService } from 'src/app/services/api/inventory/inventory.service';
import { LocalInventoryService } from 'src/app/services/local/local-inventory/local-inventory.service';
import { LocalOrdersService } from 'src/app/services/local/local-orders/local-orders.service';
import { OrdersService } from 'src/app/services/api/orders/orders.service';

@Component({
  selector: 'app-first-opened',
  templateUrl: './first-opened.component.html',
  styleUrls: ['./first-opened.component.scss'],
  standalone: true,
  imports: [
    IonSpinner,
    IonCardContent,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
  ],
})
export class FirstOpenedComponent implements OnInit {
  protected loading: boolean = false;

  private _alert = inject(AlertsService);
  private _info = inject(GeneralInfoService);
  private _modal = inject(ModalsService);
  private _modalCtrl = inject(ModalController);
  private _file = inject(FilesService);

  //Api
  private _categoryApi = inject(CategoryService);
  private _currencyApi = inject(CurrencyService);
  private _imageApi = inject(ImageProductService);
  private _inventoryCheckApi = inject(InventoryCheckService);
  private _productsApi = inject(ProductService);
  private _unitApi = inject(UnitService);
  private _unitProductApi = inject(UnitProductService);
  private _inventoryIncomeApi = inject(InventoryIncomeService);
  private _imageCategoriesApi = inject(ImageCategoryService);
  private _productCategoryApi = inject(ProductCategoryService);
  private _purchaseApi = inject(PurchaseService);
  private _cashBoxApi = inject(CashBoxService);
  private _productPurhchase = inject(ProductPurchaseService);
  private _unitBase = inject(UnitBaseService);
  private _inventory = inject(InventoryService);
  private _orders = inject(OrdersService);

  //Local
  private _categorySto = inject(LocalCategoriesService);
  private _currenciesSto = inject(LocalCurrenciesService);
  private _inventoryCheckSto = inject(LocalInventoryCheckService);
  private _inventoryCheckDetailsSto = inject(LocalInventoryCheckDetailsService);
  private _inventoryIncomeSto = inject(LocalInventoryIncomeService);
  private _inventoryIncomeDetailSto = inject(LocalInventoryIncomeDetailService);
  private _productsSto = inject(LocalProductsService);
  private _unitProductsSto = inject(LocalUnitProductsService);
  private _unitSto = inject(LocalUnitsService);
  private _photoSto = inject(PhotosService);
  private _proCategoriesSto = inject(LocalProductCategoryService);
  private _purchaseSto = inject(LocalPurchaseService);
  private _purchaseDetailSto = inject(LocalPurchaseDetailService);
  private _cashBoxSto = inject(LocalCashBoxService);
  private _productPurchaseSto = inject(LocalProductPurchaseService);
  private _unitBaseSto = inject(LocalUnitBaseService);
  private _inventorySto = inject(LocalInventoryService);
  private _ordersSto = inject(LocalOrdersService);

  constructor() {}

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  public async onInit() {
    if (!(await this._file.requestStoragePermission())) return;
    if (!(await this._photoSto.requestGalleryAccess())) return;

    const result = await firstValueFrom(
      forkJoin([
        this._categoryApi.getAll(),
        this._currencyApi.getAll(),
        this._imageApi.getAll(),
        this._inventoryCheckApi.getAll(),
        this._productsApi.getAll(),
        this._unitApi.getAll(),
        this._unitProductApi.getAll(),
        this._inventoryIncomeApi.getAll(),
        this._imageCategoriesApi.getAll(),
        this._productCategoryApi.getAll(),
        this._purchaseApi.getAll(),
        this._cashBoxApi.getAll(),
        this._productPurhchase.getAll(),
        this._unitBase.getAll(),
        this._inventory.getAll(),
        // this._orders.getAll()
      ])
    ).catch(async (err) => {
      this._alert.showError('Error descargando los datos');
      this._info.setNotSuccessful();
      // this._file.saveError(err);
      console.error(err);
    });

    if (!result) {
      this._info.setNotSuccessful();
      this._modalCtrl.dismiss(false);
      return;
    }

    const categories = result[0] || [];
    const currencies = result[1] || [];
    const imagesPros = result[2] || [];
    const inventoryChecks = result[3] || [];
    const products = result[4] || [];
    const units = result[5] || [];
    const unitProducts = result[6] || [];
    const incomes = result[7] || [];
    const imagesCategories = result[8] || [];
    const productCategories = result[9] || [];
    const purchases = result[10] || [];
    const cashBoxes = result[11] || [];
    const productPurchases = result[12] || [];
    const unitBases = result[13] || [];
    const inventory = result[14] || [];
    // const orders = result[15] || [];
    
    imagesPros.map(
      (image) => (image.data = `data:image/png;base64,${image.data}`)
    );
    imagesCategories.map(
      (image) => (image.data = `data:image/png;base64,${image.data}`)
    );

    const setPurchases = async (purchases: Array<IPurchase>) => {
      const details: Array<IPurchaseDetail> = [];
      purchases.forEach((purchase,index) => {
        details.push(...(purchase.details || []));
        purchases[index].details = [];
      });

      await firstValueFrom(
        forkJoin([
          this._purchaseSto.set(purchases),
          this._purchaseDetailSto.set(details),
        ])
      );
    };

    const setInventoryCheckDetails = async(checks: Array<IInventoryCheck>) => {
      const details: Array<IInventoryCheckDetail> = [];
      checks.forEach((check,index) => {
        details.push(...(check.details || []));
        checks[index].details = [];
      });

      await firstValueFrom(
        forkJoin([
          this._inventoryCheckSto.set(checks),
          this._inventoryCheckDetailsSto.set(details)
        ])
      );
    }

    const setInventoryIncomeDetails = async(ins: Array<IInventoryIncome>) => {
      const details: Array<IInventoryIncomeDetail> = [];
      for(const income of ins){
        details.push(...(income.details));
        income.details = [];
      }

      await firstValueFrom(forkJoin([
        this._inventoryIncomeSto.set(ins),
        this._inventoryIncomeDetailSto.set(details)
      ]));
    }

    const result2 = await firstValueFrom(
      forkJoin([
        this._categorySto.set(categories),
        this._currenciesSto.set(currencies),
        setInventoryCheckDetails(inventoryChecks),
        this._productsSto.set(products),
        this._unitSto.set(units),
        this._unitProductsSto.set(unitProducts),
        setInventoryIncomeDetails(incomes),
        this._proCategoriesSto.set(productCategories),
        setPurchases(purchases),
        this._cashBoxSto.set(cashBoxes),
        this._productPurchaseSto.set(productPurchases),
        this._unitBaseSto.set(unitBases),
        this._inventorySto.set(inventory),
        // this._ordersSto.set(orders)
      ])
    ).catch((err) => {
      this._alert.showError('Error guardando los datos');
      this._info.setNotSuccessful();
      console.error(err);
      return err as Error;
    });

    await this._photoSto.savePhotos(imagesPros, PhotoKeys.PRODUCTS_ALBUMN);
    await this._photoSto.savePhotos(
      imagesCategories,
      PhotoKeys.CATEGORIES_ALBUM
    );

    if (!result2 || result2 instanceof Error) {
      this._modalCtrl.dismiss(false);
      return;
    }

    await this._info.setSuccesful();
    await this._modal.closeModal('first-time-modal');
    this._alert.showSuccess(
      'Datos descargados. Puede comenzar a utilizar la aplicación.'
    );
  }
}
