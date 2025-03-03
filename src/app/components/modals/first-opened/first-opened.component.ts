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
} from '@ionic/angular/standalone';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PhotoKeys } from 'src/app/models/constants';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { CategoryService } from 'src/app/services/api/category/category.service';
import { CurrencyService } from 'src/app/services/api/currency/currency.service';
import { ImageCategoryService } from 'src/app/services/api/image-category/image-category.service';
import { ImageProductService } from 'src/app/services/api/image-product/image-product.service';
import { InventoryCheckDetailService } from 'src/app/services/api/inventory-check-detail/inventory-check-detail.service';
import { InventoryIncomeDetailService } from 'src/app/services/api/inventory-income-detail/inventory-income-detail.service';
import { InventoryIncomeService } from 'src/app/services/api/inventory-income/inventory-income.service';
import { ProductService } from 'src/app/services/api/product/product.service';
import { UnitProductService } from 'src/app/services/api/unit-product/unit-product.service';
import { UnitService } from 'src/app/services/api/unit/unit.service';
import { GeneralInfoService } from 'src/app/services/local/general-info/general-info.service';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
import { LocalCurrenciesService } from 'src/app/services/local/local-currencies/local-currencies.service';
import { LocalInventoryCheckDetailsService } from 'src/app/services/local/local-inventory-check-details/local-inventory-check-details.service';
import { LocalInventoryCheckService } from 'src/app/services/local/local-inventory-check/local-inventory-check.service';
import { LocalInventoryIncomeDetailService } from 'src/app/services/local/local-inventory-income-detail/local-inventory-income-detail.service';
import { LocalInventoryIncomeService } from 'src/app/services/local/local-inventory-income/local-inventory-income.service';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { PhotosService } from 'src/app/services/photos/photos.service';

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

  //Api
  private _categoryApi = inject(CategoryService);
  private _currencyApi = inject(CurrencyService);
  private _imageApi = inject(ImageProductService);
  private _inventoryCheckApi = inject(InventoryCheckService);
  private _inventoryCheckDetailApi = inject(InventoryCheckDetailService);
  private _productsApi = inject(ProductService);
  private _unitApi = inject(UnitService);
  private _unitProductApi = inject(UnitProductService);
  private _inventoryIncomeApi = inject(InventoryIncomeService);
  private _inventoryIncomeDetailApi = inject(InventoryIncomeDetailService);
  private _imageCategoriesApi = inject(ImageCategoryService);

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

  constructor() {}

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  public async onInit(){
    const result = await firstValueFrom(forkJoin([
      this._categoryApi.getAll(),
      this._currencyApi.getAll(),
      this._imageApi.getAll(),
      this._inventoryCheckApi.getAll(),
      this._inventoryCheckDetailApi.getAll(),
      this._productsApi.getAll(),
      this._unitApi.getAll(),
      this._unitProductApi.getAll(),
      this._inventoryIncomeApi.getAll(),
      this._inventoryIncomeDetailApi.getAll(),
      this._imageCategoriesApi.getAll()
    ])).catch(async err => {
      this._alert.showError('Error descargando los datos');
      this._info.setNotSuccessful();
      console.error(err);
    });

    if(!result) return;

    const categories = result[0] || [];
    const currencies = result[1] || [];
    const imagesPros = result[2] || [];
    const inventoryChecks = result[3] || [];
    const inventoryCheckDetails = result[4] || [];
    const products = result[5] || [];
    const units = result[6] || [];
    const unitProducts = result[7] || [];
    const incomes = result[8] || [];
    const incomeDetails = result[9] || [];
    const imagesCategories =result[10] || [];

    imagesPros.map(image => image.image = `data:image/png;base64,${image.image}`);
    imagesCategories.map(image => image.image = `data:image/png;base64,${image.image}`);

    const result2 = await firstValueFrom(forkJoin([
      this._categorySto.set(categories),
      this._currenciesSto.set(currencies),
      this._inventoryCheckSto.set(inventoryChecks),
      this._inventoryCheckDetailsSto.set(inventoryCheckDetails),
      this._productsSto.set(products),
      this._unitSto.set(units),
      this._unitProductsSto.set(unitProducts),
      this._inventoryIncomeSto.set(incomes),
      this._inventoryIncomeDetailSto.set(incomeDetails),
      this._photoSto.savePhotos(imagesPros, PhotoKeys.PRODUCTS_ALBUMN),
      this._photoSto.savePhotos(imagesCategories,PhotoKeys.CATEGORIES_ALBUM)
    ])).catch(err => {
      this._alert.showError('Error guardando los datos');
      this._info.setNotSuccessful();
      console.error(err);
    });

    if(!result2){
      this._modal.closeModal('first-time-modal');
      return;
    }

    await this._info.setSuccesful();
    this._modal.closeModal('first-time-modal');
    this._alert.showSuccess('Datos descargados. Puede comenzar a utilizar la aplicación.');
  }
}
