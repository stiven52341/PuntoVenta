import { Component, Input, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonSearchbar,
  IonList,
  IonItem,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  InfiniteScrollCustomEvent,
  ModalController,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';
import { DecimalPipe } from '@angular/common';
import { IProduct } from 'src/app/models/product.model';
import { IUnit } from 'src/app/models/unit.model';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { firstValueFrom, forkJoin } from 'rxjs';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.component.html',
  styleUrls: ['./prices.component.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonList,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    IonSearchbar,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    DecimalPipe,
  ],
})
export class PricesComponent implements OnInit {
  protected loading: boolean = false;
  @Input() prices: Array<IUnitProduct> = [];
  private objects: Array<{
    price: IUnitProduct;
    product?: IProduct;
    unit?: IUnit;
  }> = [];
  protected pricesFiltered: Array<{
    price: IUnitProduct;
    product?: IProduct;
    unit?: IUnit;
  }> = [];

  constructor(
    private _prices: LocalUnitProductsService,
    private _localProduct: LocalProductsService,
    private _localUnit: LocalUnitsService,
    private _modalCtrl: ModalController
  ) {}

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    if (this.prices.length == 0) {
      this.prices = (await this._prices.getAll()).sort((a, b) => +a.id - +b.id);
    } else {
      this.prices = this.prices.sort((a, b) => +a.id - +b.id);
    }

    const getDetails = async (price: IUnitProduct) => {
      const product = await this._localProduct.get(price.idProduct);
      const unit = await this._localUnit.get(price.idUnit);
      return {
        price: price,
        product: product,
        unit: unit,
      };
    };

    const pros = this.prices.map((price) => {
      return getDetails(price);
    });

    this.objects = await firstValueFrom(forkJoin(pros));

    this.generateItems(this.objects);
  }

  private generateItems(
    prices: Array<{ price: IUnitProduct; product?: IProduct; unit?: IUnit }>,
    limit: number = 25
  ) {
    const count = this.pricesFiltered.length;

    for (let i = 0; i < limit; i++) {
      if (prices[count + i]) {
        this.pricesFiltered.push(prices[count + i]);
      }
    }
  }

  protected async onClick(price: IUnitProduct) {
    await this._modalCtrl.dismiss(price);
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.generateItems(this.objects);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }
}
