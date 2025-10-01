import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { call, save, trash } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IOrderDetail } from 'src/app/models/order-detail.model';
import { IOrder } from 'src/app/models/order.model';
import { IProduct } from 'src/app/models/product.model';
import { IUnit } from 'src/app/models/unit.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { OrdersService } from 'src/app/services/api/orders/orders.service';
import { PhotoKeys, States } from 'src/app/services/constants';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { PhotosService } from 'src/app/services/photos/photos.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.page.html',
  styleUrls: ['./detail.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, HeaderBarComponent, IonCard, IonCardHeader, IonCardContent, IonCardTitle,
    IonLabel, DatePipe, DecimalPipe, IonButton, IonIcon, IonList, IonItem, IonFooter
  ]
})
export class DetailPage implements OnInit {
  protected order?: IOrder;
  protected loading: boolean = false;
  protected detailsFiltered: Array<{ detail: IOrderDetail, product: IProduct, unit: IUnit, image: string }> = [];
  private readonly loadingImg: string = '../../assets/icon/loading.gif';
  private readonly noImage: string = '../../assets/no-image.png';

  constructor(
    private _order: OrdersService,
    private _route: ActivatedRoute,
    private _photo: PhotosService,
    private _price: LocalUnitProductsService,
    private _product: LocalProductsService,
    private _unit: LocalUnitsService,
    private _alert: AlertsService,
    private _modal: ModalsService,
  ) {
    addIcons({ call, save, trash })
  }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init() {
    const idOrder = this._route.snapshot.params['id'];
    this.order = await this._order.get(idOrder);
    this.detailsFiltered = [];

    this.order?.details.forEach(async (detail, index) => {
      await this.setDetail(detail, index);
    });
  }

  protected call() {
    window.location.href = `tel:${this.order?.phone}`;
  }

  protected onClickDetail(index: number) {
    const detail = this.detailsFiltered[index];
    console.log(index);
    

    this._alert.showOptions('Confirme', '¿Qué desea hacer con este detalle?', [
      {
        label: 'Modificar',
        do: async () => {
          const price = await this._price.get(detail.detail.id.idUnitProduct);
          const newDetail = await this._modal.showProductModal(detail.product, price!, detail.image, undefined, 'order', detail.detail.amount, price);
          if (!newDetail) return;

          this.order!.details[index] = {
            id: {
              idOrder: this.order!.id,
              idUnitProduct: newDetail.price.id.valueOf()
            },
            amount: newDetail.amount,
            priceUsed: newDetail.price.price,
            state: true,
            uploaded: States.NOT_SYNCABLE
          };

          await this._order.update(this.order!);
          await this.init();
        }
      },
      {
        label: 'Eliminar',
        do: async () => {
          if (this.detailsFiltered.length == 1) {
            this._alert.showError(
              `Un pedido debe tener al menos un detalle.`
            );
            return;
          }

          if (
            !await this._alert.showConfirm(undefined, '¿Está seguro de eliminar este detalle?')
          ) {
            return;
          }

          this.detailsFiltered.splice(index, 1);
          await this.updateOrderDetails();
        }
      }
    ]);
  }

  protected async onDisable() {
    if (
      !await this._alert.showConfirm(undefined, '¿Está seguro de cancelar este pedido?')
    ) {
      return;
    }
  }

  protected async onProcess() {
    if (
      !await this._alert.showConfirm(undefined, '¿Está seguro de procesar este pedido?')
    ) {
      return;
    }
  }

  private async updateOrderDetails() {
    this.order!.details = [];
    this.detailsFiltered.forEach(detail => {
      this.order!.details.push(detail.detail);
    });
    await this._order.update(this.order!);
  }

  private async setDetail(detail: IOrderDetail, index: number) {
    const price = await this._price.get(detail.id.idUnitProduct);
    const data = await firstValueFrom(forkJoin([
      this._product.get(price!.idProduct),
      this._unit.get(price!.idUnit)
    ]));
    const product = data[0];
    const unit = data[1];

    this.detailsFiltered.push({
      detail: detail,
      image: this.loadingImg,
      product: product!,
      unit: unit!
    });

    this._photo.getPhoto(price!.idProduct.toString(), PhotoKeys.PRODUCTS_ALBUMN).then(photo => {
      this.detailsFiltered[index].image = photo || this.noImage;
    });
  }
}
