import { Component, EventEmitter, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonInput,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { IProduct } from 'src/app/models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IUnit } from 'src/app/models/unit.model';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';

@Component({
  selector: 'app-mant-prices',
  templateUrl: './mant-prices.page.html',
  styleUrls: ['./mant-prices.page.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonButton,
    IonInput,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    FormsModule,
  ],
})
export class MantPricesPage implements OnInit {
  protected loading: boolean = false;
  protected product?: IProduct;
  protected unit?: IUnit;
  protected prices: Array<IUnitProduct> = [];
  protected showPrices: boolean = false;
  protected selectedPrice?: IUnitProduct;

  private fieldsFullfilled: EventEmitter<void>;

  constructor(
    private _modal: ModalsService,
    private _prices: LocalUnitProductsService
  ) {
    addIcons({ search });

    this.fieldsFullfilled = new EventEmitter<void>();
  }

  ngOnInit() {
    this.fieldsFullfilled.subscribe(async () => {
      this.loading = true;
      this.prices = (await this._prices.getAll()).filter(
        (price) =>
          +price.idProduct == +this.product!.id &&
          +price.idUnit == +this.unit!.id
      );
      this.prices.length > 0 ? this.showPrices = true : this.showPrices = false;
      this.loading = false;
    });
  }

  protected async onSearchProduct() {
    const result = (await this._modal.showProductListModal())?.product;
    if (!result) return;

    this.product = result;
    if (this.unit) this.fieldsFullfilled.emit();
  }

  protected async onSearchUnit() {
    const result = await this._modal.showUnitsList();
    if (!result) return;

    this.unit = result;
    if (this.product) this.fieldsFullfilled.emit();
  }

  protected async onSearchPrice(){
    const result = await this._modal.showPrices(this.prices);
    if (!result) return;

    this.selectedPrice = result;
  }
}
