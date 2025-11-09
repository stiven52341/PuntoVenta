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
import { IInventoryIncomeDetail } from 'src/app/models/inventory-income-detail.model';
import { InventoryIncomeDetailsComponent } from 'src/app/components/modals/inventory-income-details/inventory-income-details.component';
import { IInventoryCheckDetail } from 'src/app/models/inventory-check-detail.model';
import { InventoryCheckDetailsComponent } from 'src/app/components/modals/inventory-check-details/inventory-check-details.component';
import { IInventoryIncome } from 'src/app/models/inventory-income.model';
import { InventoryIncomesListComponent } from 'src/app/components/modals/inventory-incomes-list/inventory-incomes-list.component';
import { IClient } from 'src/app/models/client.model';
import { ClientsListComponent } from 'src/app/components/modals/clients-list/clients-list.component';
import { IBill } from 'src/app/models/bill.model';
import { BillPayComponent } from 'src/app/components/modals/bill-pay/bill-pay.component';
import { IInventoryCheck } from 'src/app/models/inventory-check.model';
import { InventoryChecksListComponent } from 'src/app/components/modals/inventory-checks-list/inventory-checks-list.component';
import { ICashBox } from 'src/app/models/cash-box.model';
import { CashBoxesListComponent } from 'src/app/components/modals/cash-boxes-list/cash-boxes-list.component';
import { IBillInvoice } from 'src/app/models/bill-invoice.model';
import { BillInvoicesListComponent } from 'src/app/components/modals/bill-invoices-list/bill-invoices-list.component';
import { IEmployee } from 'src/app/models/employee.model';
import { EmployeesListComponent } from 'src/app/components/modals/employees-list/employees-list.component';

@Injectable({
  providedIn: 'root',
})
export class ModalsService {
  private modals: Array<HTMLIonModalElement> = [];

  constructor(private _modalCtrl: ModalController) { }

  public async showModal(
    component: any,
    id?: string,
    data?: any,
    cssClass: string = 'default',
    canDismiss: boolean = true,
    partialModal: boolean = false,
    initHeight: number = 0.6
  ) {
    const modalInfo: any = {
      component: component,
      animated: true,
      componentProps: data,
      cssClass: cssClass,
      canDismiss: canDismiss,
      id: id,
      breakpoints: undefined, // can snap to 0% (dismiss), 30%, 60%, or 100%
      initialBreakpoint: undefined
    };

    if (partialModal) {
      (modalInfo.breakpoints = [0, 0.3, 0.6, 1]),
        (modalInfo.initialBreakpoint = initHeight);
    }

    const modal = await this._modalCtrl.create(modalInfo);

    this.modals.push(modal);

    await modal.present();

    return await modal.onWillDismiss();
  }

  public async showFirstOpenedModal(): Promise<boolean> {
    const result = await this.showModal(
      FirstOpenedComponent,
      'first-time-modal'
    );
    if (result && result.data) return result.data as boolean;
    return false;
  }

  public async showProductModal(
    product: IProduct,
    unitProduct?: IUnitProduct,
    image?: string,
    productCategories?: Array<IProductCategory>,
    type: 'normal' | 'order' = 'normal',
    defaultAmount?: number,
    defaultPrice?: IUnitProduct
  ): Promise<{ product: IProduct, price: IUnitProduct, amount: number } | undefined> {
    const result = await this.showModal(ProductComponent, 'product-detail-modal', {
      product: product,
      image: image,
      unitProduct: unitProduct,
      productCategories: productCategories || [],
      type: type,
      defaultAmount,
      defaultPrice
    });

    if (result && result.data) {
      return result.data as { product: IProduct, price: IUnitProduct, amount: number };
    }
    return undefined;
  }

  public async showProductListModal(showOnlyActiveProducts: boolean = false): Promise<
    { product: IProduct; image: string } | undefined
  > {
    const result = (
      await this.showModal(ProductListComponent, 'product-list-modal', { showOnlyActiveProducts })
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

  public async showCategoriesList(
    showNullCategories: boolean = true
  ): Promise<{ category: ICategory; image: string } | undefined> {
    const result = await this.showModal(CategoriesListComponent, 'sells-list', {
      showNullCategories: showNullCategories,
    });
    if (result && result.data)
      return result.data as { category: ICategory; image: string };
    return undefined;
  }

  public async showCashbox(
    type: 'open' | 'close',
    balance: number = 0
  ): Promise<number | undefined> {
    const result = await this.showModal(
      CashBoxComponent,
      'sells-list',
      { type: type, balance: balance },
      'my-partial-modal'
    );
    if (result && result.data) return result.data as number;
    return undefined;
  }

  public async showInventoryIncomeDetailsList(
    details: Array<IInventoryIncomeDetail>,
    showWarningBeforeSelect: boolean = false
  ): Promise<IInventoryIncomeDetail | undefined> {
    const result = await this.showModal(
      InventoryIncomeDetailsComponent,
      'inventory-income-details-list',
      { details: details, showWarningBeforeSelect: showWarningBeforeSelect },
    );

    if (result && result.data) return result.data as IInventoryIncomeDetail;
    return undefined;
  }

  public async showInventoryCheckDetailsList(
    details: Array<IInventoryCheckDetail>, showWarning: boolean = false
  ) {
    const result = await this.showModal(
      InventoryCheckDetailsComponent,
      'inventory-check-details-list',
      { details: details, showWarning: showWarning }
    );
    if (result && result.data) return result.data as IInventoryCheckDetail;
    return undefined;
  }

  public async showInventoryIncomesList(): Promise<IInventoryIncome | undefined> {
    const result = await this.showModal(
      InventoryIncomesListComponent,
      'inventory-check-details-list'
    );
    if (result && result.data) return result.data as IInventoryIncome;
    return undefined;
  }

  public async showClientsList(showWithBalance: boolean = false, showPositiveBalance: boolean = false): Promise<IClient | undefined> {
    const result = await this.showModal(
      ClientsListComponent,
      'clients-list',
      { showWithBalance, showPositiveBalance },
      undefined
    );
    if (result && result.data) return result.data as IClient;
    return undefined;
  }

  public async showBillPay(idBill: number, bill?: IBill): Promise<IBill | undefined> {
    const result = await this.showModal(
      BillPayComponent,
      'bill-pay',
      { idBill, bill },
      undefined, true, true, .8
    );
    if (result && result.data) return result.data as IBill;
    return undefined;
  }

  public async showInventoryChecksList(): Promise<IInventoryCheck | undefined> {
    const result = await this.showModal(
      InventoryChecksListComponent,
      'inventory-checks-list',
    );
    if (result && result.data) return result.data as IInventoryCheck;
    return undefined;
  }

  public async showCashBoxesList(): Promise<ICashBox | undefined> {
    const result = await this.showModal(
      CashBoxesListComponent,
      'cash-boxes-list',
    );
    if (result && result.data) return result.data as ICashBox;
    return undefined;
  }

  public async showBillInvoicesList(): Promise<IBillInvoice | undefined> {
    const result = await this.showModal(
      BillInvoicesListComponent,
      'cash-boxes-list',
    );
    if (result && result.data) return result.data as IBillInvoice;
    return undefined;
  }

  public async showEmployeesList(): Promise<IEmployee | undefined>{
    const result = await this.showModal(
      EmployeesListComponent,
      'employees-list',
    );
    if (result && result.data) return result.data as IEmployee;
    return undefined;
  }

  public async closeModal(id?: string, data?: any) {
    this._modalCtrl.dismiss(data, undefined, id);
  }

  public async closeAllModals() {
    this.modals.map((modal) => modal.dismiss());
  }
}
