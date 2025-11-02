import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFooter, IonHeader, IonIcon, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList } from '@ionic/angular/standalone';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { PhotoKeys } from 'src/app/services/constants';
import { IInventoryIncomeDetail } from 'src/app/models/inventory-income-detail.model';
import { IInventoryIncome } from 'src/app/models/inventory-income.model';
import { IProduct } from 'src/app/models/product.model';
import { IUnit } from 'src/app/models/unit.model';
import { LocalInventoryIncomeDetailService } from 'src/app/services/local/local-inventory-income-detail/local-inventory-income-detail.service';
import { LocalInventoryIncomeService } from 'src/app/services/local/local-inventory-income/local-inventory-income.service';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { LocalPrinterService } from 'src/app/services/local/local-printer/printer.service';
import { PrintingService } from 'src/app/services/printing/printing.service';
import { Printer } from 'src/app/models/printer.model';
import { addIcons } from 'ionicons';
import { print } from 'ionicons/icons';

interface IDetails {
  detail: IInventoryIncomeDetail, product: IProduct, image: string, unit: IUnit, baseUnit?: IUnit
}

@Component({
  selector: 'app-product-income',
  templateUrl: './product-income.page.html',
  styleUrls: ['./product-income.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, HeaderBarComponent, IonCard, IonCardContent, IonLabel,
    DatePipe, DecimalPipe, IonCardHeader, IonCardTitle, IonList, IonInfiniteScroll, IonInfiniteScrollContent,
    IonItem, IonFooter, IonButton, IonIcon
  ]
})
export class ProductIncomePage implements OnInit {
  protected loading: boolean = false;
  protected income?: IInventoryIncome;
  protected details: Array<IInventoryIncomeDetail> = [];
  protected detailsFiltered: Array<IDetails> = [];
  private readonly loadingImage: string = '../../../assets/icon/loading.gif';
  private readonly noImage: string = '../../../assets/no-image.png';
  protected printer?: Printer;

  constructor(
    private _route: ActivatedRoute, private _localIncome: LocalInventoryIncomeService,
    private _router: Router, private _localIncomeDetails: LocalInventoryIncomeDetailService,
    private _localProduct: LocalProductsService, private _photo: PhotosService,
    private _localUnit: LocalUnitsService,
    private _localPrinter: LocalPrinterService,
    private _print: PrintingService
  ) {
    addIcons({print});
  }

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    const id = this._route.snapshot.params['id'] as number;
    this.income = await this._localIncome.get(id);
    if (!this.income) {
      this._router.navigate(['/consults']);
      return;
    }
    this.details = (await this._localIncomeDetails.getByIncome(Number(this.income.id)));
    this._localPrinter.getCurrentPrinter().then(printer => {
      this.printer = printer;
    });
    await this.generateItems();
  }

  private async generateItems(offset: number = 10) {
    const count = this.detailsFiltered.length;

    const getData = async (detail: IInventoryIncomeDetail) => {
      const data = await firstValueFrom(forkJoin([
        this._localProduct.get(detail.id.idProduct),
        this._localUnit.get(detail.id.idUnit),
      ]));

      const baseUnit = detail.idBaseUnit ? await this._localUnit.get(detail.idBaseUnit) : undefined;

      this._photo.getPhoto(data[0]!.id.toString(), PhotoKeys.PRODUCTS_ALBUMN).then((photo) => {
        const index = this.detailsFiltered.findIndex(d => {
          return d.detail.id == detail.id
        });
        this.detailsFiltered[index].image = photo || this.noImage;
      });

      return {
        detail: detail,
        product: data[0],
        unit: data[1],
        image: this.loadingImage,
        baseUnit: baseUnit
      } as IDetails;
    }

    for (let i = 0; i < offset; i++) {
      if (this.details[i + count]) {
        this.detailsFiltered.push(await getData(this.details[i + count]));
      }
    }
  }

  async onIonInfinite(event: InfiniteScrollCustomEvent) {
    await this.generateItems();
    event.target.complete();
  }

  protected async onPrint(){
    if(!this.printer || !this.income) return;
    await this._print.printInventoryIncome(this.income, '¿Está seguro de reimprimir la compra de mercancías?');
  }
}
