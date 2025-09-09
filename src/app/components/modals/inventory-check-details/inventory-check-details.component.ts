import { Component, Input, OnInit } from '@angular/core';
import { IonCard, IonContent, IonHeader, IonItem, IonLabel, IonList, ModalController } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { IInventoryCheckDetail } from 'src/app/models/inventory-check-detail.model';
import { DecimalPipe } from '@angular/common';
import { IProduct } from 'src/app/models/product.model';
import { IUnit } from 'src/app/models/unit.model';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { firstValueFrom, forkJoin } from 'rxjs';
import { PhotoKeys } from 'src/app/services/constants';
import { AlertsService } from 'src/app/services/alerts/alerts.service';

@Component({
  selector: 'app-inventory-check-details',
  templateUrl: './inventory-check-details.component.html',
  styleUrls: ['./inventory-check-details.component.scss'],
  standalone: true,
  imports: [
    IonHeader, IonContent, HeaderBarComponent, IonList, IonItem,
    IonCard, IonLabel, DecimalPipe
  ]
})
export class InventoryCheckDetailsComponent implements OnInit {
  @Input({ required: true }) details!: Array<IInventoryCheckDetail>;
  @Input() showWarning: boolean = false;
  protected detailsInfo: Array<{
    detail: IInventoryCheckDetail;
    product: IProduct;
    unit: IUnit;
    unitBase: IUnit;
    image: string;
  }> = [];
  protected loading: boolean = false;
  private loadingGif: string = '../../../assets/icon/loading.gif';
  private noImage: string = '../../../assets/no-image.png';

  constructor(
    private _localProduct: LocalProductsService, private _localUnit: LocalUnitsService,
    private _photo: PhotosService, private _alert: AlertsService,
    private _modalCtrl: ModalController
  ) { }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init() {
    for (let i = 0; i < this.details.length; i++) {
      const data = await firstValueFrom(forkJoin([
        this._localProduct.get(this.details[i].id.idProduct),
        this._localUnit.get(this.details[i].id.idUnit),
        this._localUnit.get(this.details[i].idBaseUnit)
      ]));

      this.detailsInfo.push({
        detail: this.details[i],
        product: data[0]!,
        unit: data[1]!,
        unitBase: data[2]!,
        image: this.loadingGif
      });
      this._photo.getPhoto(this.details[i].id.idProduct.toString(), PhotoKeys.PRODUCTS_ALBUMN)
        .then((data) => {
          this.detailsInfo[i].image = data || this.noImage;
        });
    }
  }

  protected async onClick(detail: IInventoryCheckDetail) {
    if(this.showWarning){
      const result = await this._alert.showConfirm('CONFIRME', '¿Está seguro de seleccionar este detalle?');
      if(!result) return;
    }
    await this._modalCtrl.dismiss(detail, 'inventory-check-details-list');
  }
}
