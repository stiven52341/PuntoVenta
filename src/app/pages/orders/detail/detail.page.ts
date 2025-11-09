import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFooter, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addCircle, call, refreshCircle, save, trash } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IOrderDetail } from 'src/app/models/order-detail.model';
import { IOrder } from 'src/app/models/order.model';
import { IProduct } from 'src/app/models/product.model';
import { IUnit } from 'src/app/models/unit.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { ErrorsService } from 'src/app/services/api/errors/errors.service';
import { OrdersService } from 'src/app/services/api/orders/orders.service';
import { PhotoKeys, States } from 'src/app/services/constants';
import { FilesService } from 'src/app/services/files/files.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { LocalCartService } from 'src/app/services/local/local-cart/local-cart.service';
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
    private _router: Router,
    private _file: FilesService,
    private _error: ErrorsService,
    private _cart: LocalCartService,
    private _global: GlobalService
  ) {
    addIcons({ call, save, trash, addCircle, refreshCircle });
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
    if(!this.order!.state || this.order!.processed){
      this._alert.showError('No puede modificar un pedido desactivado o procesado');
      return;
    }

    const detail = this.detailsFiltered[index];

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

    this.loading = true;
    this._order.delete(this.order!).then(() => {
      this._alert.showSuccess(`Pedido #${this.order!.id} anulado`);
      // this._router.navigate(['/orders']);
      this._global.updateOrders();
      this.ngOnInit();
    }).catch(err => {
      this._alert.showError('Error desactivando pedido');
      this._file.saveError(err);
      this._error.saveErrors(err);
    }).finally(() => {
      this.loading = false;
    });
  }

  protected async onProcess() {
    this.loading = true;
    const cart = await firstValueFrom(this._cart.getCart());
    if(cart.products.length > 0){
      this._alert.showError(
        `<b>Tiene productos en el carrito.</b><br>
        Termine la venta pendiente antes de procesar el pedido`
      );
      this.loading = false;
      return;
    }

    if(this.detailsFiltered.length == 0 || this.order!.details.length == 0){
      this._alert.showError('El pedido debe tener detalles');
      this.loading = false;
      return;
    }

    if(!this.order!.state){
      this._alert.showError('No puede procesar un pedido desactivado');
      this.loading = false;
      return;
    }

    if (
      !await this._alert.showConfirm(undefined, '¿Está seguro de procesar este pedido?')
    ) {
      this.loading = false;
      return;
    }

    

    for(const detail of this.order!.details){
      const price = await this._price.get(detail.id.idUnitProduct);
      const product = await this._product.get(price!.idProduct);
      await this._cart.addProduct(product!,detail.amount,price!);
    }
    this.order!.processed = true;
    this._order.update(this.order!).then(() => {
      this._alert.showSuccess('Artículos del pedido agregados al carrito');
      this._router.navigate(['/home/cart']);
      this._global.updateOrders();
    }).catch(err => {
      this._alert.showError('Error al procesar el pedido');
      this._file.saveError(err);
      this._error.saveErrors(err);
    }).finally(() => this.loading = false);
    
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

  protected async onAddDetail() {
    const product = await this._modal.showProductListModal(true);

    if (!product) return;

    const index = this.detailsFiltered.findIndex(detail => detail.product.id == product.product.id);
    if(index != -1){
      this._alert.showError(`El producto <b>${product.product.name}</b> ya está en el pedido`);
      return;
    }

    const detail = await this._modal.showProductModal(
      product.product, undefined, product.image, undefined, 'order'
    );

    const newDetail: IOrderDetail = {
      id: {
        idOrder: this.order!.id,
        idUnitProduct: detail!.price.id as number
      },
      amount: detail!.amount,
      priceUsed: detail!.price.price,
      state: true,
      uploaded: States.NOT_SYNCABLE
    };
    this.order?.details.unshift(newDetail);
    await this._order.update(this.order!);
    await this.init();
  }

  protected async reactivateDetail(){
    if(
      !await this._alert.showConfirm(undefined, '¿Está seguro de reactivar el pedido?')
    ){
      return;
    }

    this.loading = true;
    this.order!.state = true;
    this._order.update(this.order!).then(() => {
      this._alert.showSuccess(`Pedido #${this.order!.id} reactivado`);
      // this._router.navigate(['/orders']);
      this._global.updateOrders();
      this.ngOnInit();
    }).catch(err => {
      this._alert.showError('Error al reactivar el pedido');
      this._file.saveError(err);
      this._error.saveErrors(err);
    }).finally(() => this.loading = false);
  }
}
