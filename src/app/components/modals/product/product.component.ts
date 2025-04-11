import { Component, Input, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonIcon,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../header-bar/header-bar.component';
import { IProduct } from 'src/app/models/product.model';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { IProductCategory } from 'src/app/models/product-category.model';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
import { ICategory } from 'src/app/models/category.model';
import { addIcons } from 'ionicons';
import { heart, shareSocial, camera } from 'ionicons/icons';
import { FormsModule, NgModel } from '@angular/forms';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { UnitProductService } from 'src/app/services/api/unit-product/unit-product.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { IUnit } from 'src/app/models/unit.model';
import { LocalCartService } from 'src/app/services/local/local-cart/local-cart.service';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  imports: [
    UpperCasePipe,
    IonLabel,
    DecimalPipe,
    FormsModule,
    IonIcon,
    IonInput,
    IonButton,
    IonHeader,
    HeaderBarComponent,
    IonContent,
    IonSelect,
    IonSelectOption,
  ],
})
export class ProductComponent implements OnInit {
  @Input({ required: true }) product?: IProduct;
  @Input() image?: string;
  @Input() productCategories?: Array<IProductCategory> = [];

  protected prices: Array<{ unitPro: IUnitProduct; unit: IUnit }> = [];
  protected selectedPrice?: number;

  protected cantidad?: number;

  protected categories: Array<ICategory> = [];

  constructor(
    private _categories: LocalCategoriesService,
    private _prices: LocalUnitProductsService,
    private _unit: LocalUnitsService,
    private _cart: LocalCartService,
    private _alert: AlertsService,
    private _toast: ToastService
  ) {
    addIcons({ heart, shareSocial, camera });
  }

  async ngOnInit() {
    const data = await firstValueFrom(
      forkJoin([
        this._categories.getAll(),
        this._prices.getAll(),
        this._unit.getAll(),
      ])
    );

    if (this.productCategories && this.productCategories.length > 0) {
      this.categories = data[0].filter((category) => {
        return this.productCategories?.some(
          (pc) => pc.id.idCategory == category.id
        );
      });
    }

    data[1].forEach((unitProduct) => {
      if (unitProduct.idProduct == this.product!.id && unitProduct.state) {
        const unit = data[2].find((unit) => unit.id == unitProduct.idUnit);
        if (unit) {
          this.prices.push({
            unitPro: unitProduct,
            unit: unit,
          });
        }
      }
    });
    this.selectedPrice = this.prices[0].unitPro.id;

    this._cart.getCart().subscribe((cart) => {
      console.log(cart);
    });
  }

  protected getTotal() {
    return (
      (this.prices.find((p) => p.unitPro.id == this.selectedPrice)?.unitPro
        .price || 0) * (this.cantidad || 0)
    );
  }

  private async check(): Promise<boolean> {
    if (!this.cantidad || this.cantidad <= 0) {
      await this._alert.showError('CANTIDAD INVÁLIDA');
      return false;
    }
    if (
      !this.selectedPrice ||
      !this.prices.some((price) => price.unitPro.id == this.selectedPrice)
    ) {
      await this._alert.showError('PRECIO INVÁLIDO');
      return false;
    }
    return true;
  }

  protected async onAddProduct() {
    if (!(await this.check())) return;

    await this._cart.addProduct(
      this.product!,
      this.cantidad!,
      this.prices.find((price) => price.unitPro.id == this.selectedPrice)!
        .unitPro
    );

    await this._toast.showToast('PRODUCTO AGREGADO',1000);
  }
}
