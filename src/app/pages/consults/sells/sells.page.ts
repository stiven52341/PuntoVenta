import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonCard,
  IonContent,
  IonHeader,
  IonCardHeader,
  IonCardContent,
  IonLabel,
  IonCardTitle,
  IonList,
  IonItem,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { IProduct } from 'src/app/models/product.model';
import { IPurchaseDetail } from 'src/app/models/purchase-detail.model';
import { IPurchase } from 'src/app/models/purchase.model';
import { IUnit } from 'src/app/models/unit.model';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { LocalPurchaseDetailService } from 'src/app/services/local/local-purchase-detail/local-purchase-detail.service';
import { LocalPurchaseService } from 'src/app/services/local/local-purchase/local-purchase.service';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';

@Component({
  selector: 'app-sells',
  templateUrl: './sells.page.html',
  styleUrls: ['./sells.page.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonList,
    IonCardTitle,
    IonLabel,
    IonCardContent,
    IonCardHeader,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    IonCard,
    DatePipe,
    DecimalPipe,
  ],
})
export class SellsPage implements OnInit, ViewWillEnter {
  private id: number;
  protected purchase?: IPurchase;
  protected purchaseDetails: Array<{
    detail: IPurchaseDetail;
    product: IProduct;
    unit: IUnit;
  }> = [];

  protected loading: boolean = false;
  private noImage: string = '../../../../assets/no-image.png';

  constructor(
    private _route: ActivatedRoute,
    private _purchase: LocalPurchaseService,
    private _purchasesDetails: LocalPurchaseDetailService,
    private _price: LocalUnitProductsService,
    private _product: LocalProductsService,
    private _unit: LocalUnitsService
  ) {
    this.id = Number(this._route.snapshot.params['id']);
  }

  async ngOnInit() {}
  async ionViewWillEnter() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    this.purchase = await this._purchase.get(this.id);
    const details = (await this._purchasesDetails.getAll()).filter(
      (detail) => +detail.id.idPurchase == +this.id
    );

    const setDetail = async (detail: IPurchaseDetail) => {
      const price = await this._price.get(detail.id.idUnitProductCurrency);

      const result = await firstValueFrom(
        forkJoin([
          this._product.get(price!.idProduct),
          this._unit.get(price!.idUnit),
        ])
      );
      this.purchaseDetails.push({
        detail: detail,
        product: result[0]!,
        unit: result[1]!,
      });
    };

    for (const detail of details) {
      await setDetail(detail);
    }
  }
}
