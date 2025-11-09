import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { InfiniteScrollCustomEvent, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFooter, IonHeader, IonIcon, IonImg, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IInventoryCheckDetail } from 'src/app/models/inventory-check-detail.model';
import { IInventoryCheck } from 'src/app/models/inventory-check.model';
import { IProduct } from 'src/app/models/product.model';
import { IUnit } from 'src/app/models/unit.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { PhotoKeys } from 'src/app/services/constants';
import { LocalInventoryCheckDetailsService } from 'src/app/services/local/local-inventory-check-details/local-inventory-check-details.service';
import { LocalInventoryCheckService } from 'src/app/services/local/local-inventory-check/local-inventory-check.service';
import { LocalPrinterService } from 'src/app/services/local/local-printer/printer.service';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { PrintingService } from 'src/app/services/printing/printing.service';

@Component({
  selector: 'app-inventory-checks',
  templateUrl: './inventory-checks.page.html',
  styleUrls: ['./inventory-checks.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, HeaderBarComponent, IonCard, IonCardHeader, IonCardContent, IonCardTitle,
    DatePipe, IonList, IonItem, IonLabel, IonInfiniteScroll, IonInfiniteScrollContent,
    IonImg, IonFooter,IonButton, IonIcon
  ]
})
export class InventoryChecksPage implements OnInit {
  protected check?: IInventoryCheck;
  protected loading: boolean = false;
  private readonly noImage: string = '../../../assets/no-image.png';
  private readonly loadingImage: string = '../../../assets/icon/loading.gif';
  protected detailsFiltered: Array<{
    detail: IInventoryCheckDetail, photo: string, product: IProduct, unit: IUnit, baseUnit?: IUnit
  }> = [];
  protected isPrinter: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _check: LocalInventoryCheckService,
    private _checkDetails: LocalInventoryCheckDetailsService,
    private _router: Router,
    private _alert: AlertsService,
    private _product: LocalProductsService,
    private _unit: LocalUnitsService,
    private _photo: PhotosService,
    private _localPrinter: LocalPrinterService,
    private _print: PrintingService
  ) {
    addIcons({save});
  }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init() {
    const id = this._route.snapshot.params['id'] as number;
    this.check = await this._check.get(id);

    if (!this.check) {
      this._alert.showError(`No se encontró el pase de inventario #${id}`);
      this._router.navigate(['/home/consults']);
      return;
    }

    this._localPrinter.getCurrentPrinter().then((printer) => {
      this.isPrinter = printer ? true : false;
    });

    this.check.details = await this._checkDetails.getByInventory(id);

    await this.generateItems(this.check.details);
  }

  private async generateItems(list: Array<IInventoryCheckDetail>, limit: number = 15) {
    const count = this.detailsFiltered.length;

    for(let i = 0; i < limit; i++){
      const detail = list[count + i];
      if(detail){
        const data = await firstValueFrom(forkJoin([
          this._product.get(detail.id.idProduct),
          this._unit.get(detail.id.idUnit),
          this._unit.get(detail.idBaseUnit)
        ]));
        const product = data[0];
        const unit = data[1];
        const unitBase = data[2];

        const index = this.detailsFiltered.push({
          detail: detail,
          baseUnit: unitBase,
          unit: unit!,
          product: product!,
          photo: this.loadingImage
        }) - 1;

        this._photo.getPhoto(product!.id.toString(), PhotoKeys.PRODUCTS_ALBUMN).then(photo => {
          this.detailsFiltered[index].photo = photo || this.noImage;
        });
      }
    }
  }

  async onIonInfinite($event: InfiniteScrollCustomEvent) {
    await this.generateItems(this.check?.details || []);
    setTimeout(() => {
      $event.target.complete();
    }, 500);
  }

  protected async onPrint(){
    if(!this.check) return;
    await this._print.printInventoryCheck(this.check, '¿Está seguro de reimprimir el pase de inventario?');
  }
}
