import { IProduct } from './../../models/product.model';
import { forwardRef, Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { FirstOpenedComponent } from 'src/app/components/modals/first-opened/first-opened.component';
import { PricesComponent } from 'src/app/components/modals/prices/prices.component';
import { ProductListComponent } from 'src/app/components/modals/product-list/product-list.component';
import { ProductComponent } from 'src/app/components/modals/product/product.component';
import { UnitListComponent } from 'src/app/components/modals/unit-list/unit-list.component';
import { SellsListComponent } from 'src/app/components/modals/sells-list/sells-list.component';
import { IProductCategory } from 'src/app/models/product-category.model';
import { IPurchase } from 'src/app/models/purchase.model';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { IUnit } from 'src/app/models/unit.model';
import { CategoriesListComponent } from 'src/app/components/modals/categories-list/categories-list.component';
import { ICategory } from 'src/app/models/category.model';
import { CashBoxComponent } from 'src/app/components/modals/cash-box/cash-box.component';

@Injectable({
  providedIn: 'root',
})
export class ModalsService {
  private modals: Array<HTMLIonModalElement> = [];

  constructor(private _modalCtrl: ModalController) {}

  public async showModal(
    component: any,
    id?: string,
    data?: any,
    cssClass: string = 'default',
    canDismiss: boolean = true,
    partialModal: boolean = false
  ) {
    const modalInfo: any = {
      component: component,
      animated: true,
      componentProps: data,
      cssClass: cssClass,
      canDismiss: canDismiss,
      id: id,
      breakpoints: undefined, // can snap to 0% (dismiss), 30%, 60%, or 100%
      initialBreakpoint: undefined,
    };

    if (partialModal) {
      (modalInfo.breakpoints = [0, 0.3, 0.6, 1]),
        (modalInfo.initialBreakpoint = 0.4);
    }

    const modal = await this._modalCtrl.create(modalInfo);

    this.modals.push(modal);

    await modal.present();

    return await modal.onWillDismiss();
  }

  public async showFirstOpenedModal(): Promise<boolean> {
    const result = await this.showModal(FirstOpenedComponent, 'first-time-modal');
    if (result && result.data) return result.data as boolean;
    return false;
  }

  public async showProductModal(
    product: IProduct,
    unitProduct: IUnitProduct,
    image?: string,
    productCategories?: Array<IProductCategory>
  ) {
    return await this.showModal(ProductComponent, 'product-detail-modal', {
      product: product,
      image: image,
      unitProduct: unitProduct,
      productCategories: productCategories || [],
    });
  }

  public async showProductListModal(): Promise<
    { product: IProduct; image: string } | undefined
  > {
    const result = (
      await this.showModal(ProductListComponent, 'product-list-modal')
    )?.data;
    if (result) {
      return result as { product: IProduct; image: string };
    }
    return undefined;
  }

  public async showUnitsList(): Promise<IUnit | undefined> {
    const result = await this.showModal(UnitListComponent, 'unit-list');
    if (result && result.data) return result.data as IUnit;
    return undefined;
  }

  public async showPrices(
    prices?: Array<IUnitProduct>
  ): Promise<IUnitProduct | undefined> {
    const result = await this.showModal(PricesComponent, 'prices-list', {
      prices: prices,
    });
    if (result && result.data) return result.data as IUnitProduct;
    return undefined;
  }

  public async showSellsList(): Promise<IPurchase | undefined> {
    const result = await this.showModal(SellsListComponent, 'sells-list');
    if (result && result.data) return result.data as IPurchase;
    return undefined;
  }

  public async showCategoriesList(showNullCategories: boolean = true): Promise<
    { category: ICategory; image: string } | undefined
  > {
    const result = await this.showModal(CategoriesListComponent, 'sells-list', {showNullCategories: showNullCategories});
    if (result && result.data)
      return result.data as { category: ICategory; image: string };
    return undefined;
  }

  public async showCashbox(
    type: 'open' | 'close', balance: number = 0
  ): Promise<number | undefined> {
    const result = await this.showModal(
      CashBoxComponent,
      'sells-list',
      { type: type, balance: balance },
      'my-partial-modal',
      undefined,
      true
    );
    if (result && result.data) return result.data as number;
    return undefined;
  }

  public async closeModal(id?: string, data?: any) {
    this._modalCtrl.dismiss(data, undefined, id);
  }

  public async closeAllModals() {
    this.modals.map((modal) => modal.dismiss());
  }
}
