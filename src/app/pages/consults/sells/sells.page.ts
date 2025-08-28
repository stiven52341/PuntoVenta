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
  ViewWillEnter, IonFooter, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { print } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { Printer } from 'src/app/models/printer.model';
import { IProduct } from 'src/app/models/product.model';
import { IPurchaseDetail } from 'src/app/models/purchase-detail.model';
import { IPurchase } from 'src/app/models/purchase.model';
import { IUnit } from 'src/app/models/unit.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { LocalPrinterService } from 'src/app/services/local/local-printer/printer.service';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { LocalPurchaseDetailService } from 'src/app/services/local/local-purchase-detail/local-purchase-detail.service';
import { LocalPurchaseService } from 'src/app/services/local/local-purchase/local-purchase.service';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { PrintingService } from 'src/app/services/printing/printing.service';

@Component({
  selector: 'app-sells',
  templateUrl: './sells.page.html',
  styleUrls: ['./sells.page.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonFooter, 
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
  protected printer?: Printer;

  protected loading: boolean = false;
  private rawDetails: Array<IPurchaseDetail> = [];
  // private noImage: string = '../../../../assets/no-image.png';

  constructor(
    private _route: ActivatedRoute,
    private _purchase: LocalPurchaseService,
    private _purchasesDetails: LocalPurchaseDetailService,
    private _price: LocalUnitProductsService,
    private _product: LocalProductsService,
    private _unit: LocalUnitsService,
    private _alert: AlertsService,
    private _print: PrintingService,
    private _localPrinter: LocalPrinterService
  ) {
    this.id = Number(this._route.snapshot.params['id']);
    addIcons({print});
  }

  async ngOnInit() {}
  async ionViewWillEnter() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    const data = await firstValueFrom(forkJoin([this._purchase.get(this.id), this._localPrinter.getCurrentPrinter()]));

    this.purchase = data[0];
    this.printer = data[1];
    this.rawDetails = (await this._purchasesDetails.getAll()).filter(
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

    for (const detail of this.rawDetails) {
      await setDetail(detail);
    }
  }

  protected async reprint(){


    if(!this.purchase){
      this._alert.showError('No hay compra');
      return;
    }

    this._print.printPurchase(this.purchase, this.rawDetails,'¿Está seguro de reimprimir el recibo de compra?');
  }
}
