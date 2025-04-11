import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonLabel,
  IonIcon,
  IonInput,
  IonFooter,
  IonToolbar,
  IonButton,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { addIcons } from 'ionicons';
import { trash, camera } from 'ionicons/icons';
import { ICart } from 'src/app/models/cart.model';
import { LocalCartService } from 'src/app/services/local/local-cart/local-cart.service';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { IProduct } from 'src/app/models/product.model';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { PhotoKeys } from 'src/app/models/constants';
import { distinctUntilChanged, firstValueFrom, forkJoin } from 'rxjs';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { FilesService } from 'src/app/services/files/files.service';
import { IPurchaseDetail } from 'src/app/models/purchase-detail.model';
import { IPurchase } from 'src/app/models/purchase.model';
import { PurchaseService } from 'src/app/services/api/purchase/purchase.service';
import { LocalPurchaseService } from 'src/app/services/local/local-purchase/local-purchase.service';

interface IProductCart {
  product: IProduct;
  unit: IUnitProduct;
  amount: number;
  photo?: string;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonToolbar,
    IonFooter,
    IonIcon,
    IonLabel,
    IonInput,
    IonContent,
    IonHeader,
    CommonModule,
    FormsModule,
    HeaderBarComponent,
  ],
})
export class CartPage implements OnInit {
  protected loading: boolean = false;
  protected cart?: ICart;
  protected products: Array<IProductCart> = [];

  constructor(
    private _cart: LocalCartService,
    private _photo: PhotosService,
    private _toast: ToastService,
    private _alert: AlertsService,
    private _file: FilesService,
    private _purchase: PurchaseService,
    private _localPurchase: LocalPurchaseService
  ) {
    addIcons({ trash, camera });
  }

  async ngOnInit() {
    await this.onInit();
  }

  private async onInit() {
    this.loading = true;
    this.cart = await this._cart.setCart();
    await this.setProducts();
    this.loading = false;

    this._cart
      .getCart()
      .pipe(distinctUntilChanged())
      .subscribe({
        next: async (cart) => {
          this.cart = cart;
          this.loading = true;
          await this.setProducts();
          this.loading = false;
        },
        error: (err) => this._file.saveError(err),
      });
  }

  private async setProducts() {
    if (!this.cart || this.cart.products.length == 0) {
      this.products = [];
      return;
    }

    this.products = [];
    const setProduct = async (product: IProductCart) => {
      product.photo = await this._photo.getPhoto(
        product.product.id.toString(),
        PhotoKeys.PRODUCTS_ALBUMN
      );
      this.products.push(product);
    };

    const pros = this.cart.products.map((product) => setProduct(product));
    await firstValueFrom(forkJoin(pros));
  }

  protected getTotalArticulo(product: IProductCart): number {
    return product.unit.price * product.amount;
  }

  protected getTotal() {
    let total = 0;
    this.products.map((product) => {
      total += this.getTotalArticulo(product);
    });
    return total;
  }

  protected async removeProduct(product: IProductCart) {
    if (this.loading) {
      this._toast.showToast(
        'NO PUEDE REMOVER UN PRODUCTO MIENTRAS SE ESTÁ CARGANDO'
      );
      return;
    }

    this.loading = true;
    await this._cart.removeProduct(product.product);
    this.loading = false;
  }

  protected async onSave() {
    const resp = await this._alert.showConfirm(
      'CONFIRME',
      '¿Está seguro de registrar la compra?'
    );

    if (!resp) return;

    let total = 0;
    const purchaseDetails: Array<IPurchaseDetail> = [];
    this.cart?.products.forEach((product) => {
      purchaseDetails.push({
        id: {
          idPurchase: 0,
          idUnitProductCurrency: product.unit.id,
        },
        amount: product.amount,
        state: true,
      });

      total += this.getTotalArticulo(product);
    });

    const purchase: IPurchase = {
      date: new Date(),
      total: total,
      state: true,
      details: purchaseDetails,
      id: 0,
    };

    const save = async (purchase: IPurchase) => {
      let updated = false;
      await this._purchase
        .insert(purchase)
        .then(() => (updated = true))
        .catch((err) => {
          this._file.saveError(err);
          this._toast.showToast(
            'ERROR AL REGISTRAR LA COMPRA EN LA BASE DE DATOS'
          );
        });

      await this._localPurchase
        .insert(purchase, updated)
        .then(async () => {
          this._toast.showToast('COMPRA REGISTRADA');
          await this._cart.resetCart();
        })
        .catch((err) => {
          this._file.saveError(err);
          this._toast.showToast('ERROR AL REGISTRAR LA COMPRA DE FORMA LOCAL');
        });
    };

    this.loading = true;
    await save(purchase);
    this.loading = false;
  }
}
