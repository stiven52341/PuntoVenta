import { AfterContentInit, Component, Input, OnInit } from '@angular/core';
import { IInventoryIncomeDetail } from 'src/app/models/inventory-income-detail.model';
import {
  IonContent,
  IonHeader,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  ModalController,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { IProduct } from 'src/app/models/product.model';
import { IUnit } from 'src/app/models/unit.model';
import { firstValueFrom, forkJoin } from 'rxjs';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { PhotoKeys } from 'src/app/models/constants';
import { DecimalPipe } from '@angular/common';
import { AlertsService } from 'src/app/services/alerts/alerts.service';

@Component({
  selector: 'app-inventory-income-details',
  templateUrl: './inventory-income-details.component.html',
  styleUrls: ['./inventory-income-details.component.scss'],
  standalone: true,
  imports: [
    IonCard,
    IonLabel,
    IonItem,
    IonList,
    IonHeader,
    IonContent,
    HeaderBarComponent,
    DecimalPipe
  ],
})
export class InventoryIncomeDetailsComponent implements OnInit {
  @Input({ required: true }) details!: Array<IInventoryIncomeDetail>;
  @Input() showWarningBeforeSelect: boolean = false;
  protected detailsInfo: Array<{
    detail: IInventoryIncomeDetail;
    product: IProduct;
    unit: IUnit;
    unitBase?: IUnit;
    image: string;
  }> = [];
  protected loading: boolean = false;

  constructor(
    private _unit: LocalUnitsService,
    private _product: LocalProductsService,
    private _photo: PhotosService,
    private _modalCtrl: ModalController,
    private _alert: AlertsService
  ) {}

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    for (const detail of this.details!) {
      this._photo
        .getPhoto(detail.id.idProduct.toString(), PhotoKeys.PRODUCTS_ALBUMN)
        .then((data) => {
          const image = data || '../../../../assets/no-image.png';
          const index = this.detailsInfo.findIndex(
            (det) => det.product.id == detail.id.idProduct
          );
          this.detailsInfo[index].image = image;
        });
      const data = await firstValueFrom(
        forkJoin([
          this._unit.get(detail.id.idUnit),
          this._product.get(detail.id.idProduct),
        ])
      );
      const unit = data[0];
      const product = data[1];
      const baseUnit = product?.idBaseUnit ? await this._unit.get(product!.idBaseUnit) : undefined;
      this.detailsInfo.push({
        detail: detail,
        image: '../../../../assets/icon/loading.gif',
        product: product!,
        unit: unit!,
        unitBase: baseUnit,
      });
    }
  }

  protected async onClick(detail: IInventoryIncomeDetail){
    if(this.showWarningBeforeSelect){
      const response = await this._alert.showConfirm('CONFIRME', '¿Está seguro se seleccionar este elemento?');
      if(!response) return;
    }

    this._modalCtrl.dismiss(detail);
  }
}
