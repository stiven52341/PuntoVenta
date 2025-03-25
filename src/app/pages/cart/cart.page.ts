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
  IonItem,
  IonTabButton,
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
import { firstValueFrom, forkJoin } from 'rxjs';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AlertsService } from 'src/app/services/alerts/alerts.service';

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
    IonTabButton,
    IonItem,
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
    private _alert: AlertsService
  ) {
    addIcons({ trash, camera });
  }

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    return new Promise<void>(async (resolve) => {
      // this.cart = await this._cart.setCart();
      this._cart.getCart().subscribe(async (cart) => {
        this.cart = cart;
        await this.setProducts();
        resolve();
      });
    });
  }

  private async setProducts() {
    if (!this.cart) return;
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
}
