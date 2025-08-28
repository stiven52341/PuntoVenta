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
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { addIcons } from 'ionicons';
import { trash, camera } from 'ionicons/icons';
import { ICart } from 'src/app/models/cart.model';
import { LocalCartService } from 'src/app/services/local/local-cart/local-cart.service';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { IProduct } from 'src/app/models/product.model';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { PhotoKeys, States } from 'src/app/models/constants';
import { distinctUntilChanged, firstValueFrom, forkJoin } from 'rxjs';
import { ToastService } from 'src/app/services/toast/toast.service';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { FilesService } from 'src/app/services/files/files.service';
import { IPurchaseDetail } from 'src/app/models/purchase-detail.model';
import { IPurchase } from 'src/app/models/purchase.model';
import { PurchaseService } from 'src/app/services/api/purchase/purchase.service';
import { LocalPurchaseService } from 'src/app/services/local/local-purchase/local-purchase.service';
import { IUnit } from 'src/app/models/unit.model';
import { PrintingService } from 'src/app/services/printing/printing.service';
import { LocalInventoryService } from 'src/app/services/local/local-inventory/local-inventory.service';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { LocalUnitBaseService } from 'src/app/services/local/local-unit-base/local-unit-base.service';

export interface IProductCart {
  product: IProduct;
  price: IUnitProduct;
  unit: IUnit;
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
  private noImage: string = '../../../assets/no-image.png';
  private loadingImage: string = '../../../assets/icon/loading.gif';

  constructor(
    private _cart: LocalCartService,
    private _photo: PhotosService,
    private _toast: ToastService,
    private _alert: AlertsService,
    private _file: FilesService,
    private _purchase: PurchaseService,
    private _localPurchase: LocalPurchaseService,
    private _printing: PrintingService,
    private _inventory: LocalInventoryService,
    private _unitProduct: LocalUnitProductsService,
    private _product: LocalProductsService,
    private _unitBase: LocalUnitBaseService
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
      product.photo = this.loadingImage;
      this._photo.getPhoto(
        product.product.id.toString(),
        PhotoKeys.PRODUCTS_ALBUMN
      ).then(photo => {
        product.photo = photo || this.noImage;
      });
      this.products.push(product);
    };



    const pros = this.cart.products.map((product) => setProduct(product));
    await firstValueFrom(forkJoin(pros));
  }

  protected getTotalArticle(product: IProductCart): number {
    return product.price.price * product.amount;
  }

  protected getTotal() {
    let total = 0;
    this.products.map((product) => {
      total += this.getTotalArticle(product);
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

    if (!await this._alert.showConfirm('CONFIRME', '¿Está seguro de remover este artículo del carrito?')) return;

    this.loading = true;
    await this._cart.removeProduct(product.product);
    this.loading = false;
  }

  protected async onSave() {
    if (this.cart?.products == undefined || this.cart.products.length == 0) {
      this._alert.showError('El carrito está vacío');
      return;
    }

    const resp = await this._alert.showConfirm(
      'CONFIRME',
      '¿Está seguro de registrar la compra?'
    );

    if (!resp) return;

    let total = 0;
    const purchaseDetails: Array<IPurchaseDetail> = [];
    this.cart?.products.forEach(async (product) => {
      purchaseDetails.push({
        id: {
          idPurchase: 0,
          idUnitProductCurrency: product.price.id as number,
        },
        amount: product.amount,
        state: true,
        priceUsed: product.price.price,
        uploaded: States.NOT_INSERTED,
      });

      total += this.getTotalArticle(product);
    });


    const purchase: IPurchase = {
      date: new Date(),
      total: total,
      state: true,
      details: purchaseDetails,
      id: 0,
      uploaded: States.NOT_INSERTED,
    };

    const save = async (purchase: IPurchase) => {
      const result = await this._purchase.insert(purchase)
        .catch((err) => {
          this._file.saveError(err);
          this._toast.showToast(
            'ERROR AL REGISTRAR LA COMPRA EN LA BASE DE DATOS'
          );
        });

      purchase.uploaded = result ? States.SYNC : States.NOT_INSERTED;

      await firstValueFrom(forkJoin([
        this._localPurchase.insert(purchase),
        this.updateInventory(purchaseDetails)
      ])).then(async () => {
        this._alert.showSuccess('COMPRA REGISTRADA');
        this._cart.resetCart();
        this._printing.printPurchase(purchase, purchaseDetails);
      }).catch((err) => {
        this._file.saveError(err);
        this._toast.showToast('ERROR AL REGISTRAR LA COMPRA DE FORMA LOCAL');
      });
    };

    this.loading = true;
    await save(purchase);
    this.loading = false;
  }

  private async updateInventory(details: Array<IPurchaseDetail>) {
    
    const sync = async (detail: IPurchaseDetail) => {
      const price = await this._unitProduct.get(detail.id.idUnitProductCurrency);
      const product = await this._product.get(price!.idProduct);

      let amount = detail.amount;
      if (product?.idBaseUnit && price!.idUnit != product.idBaseUnit) {
        const equivalency = await this._unitBase.get(
          { idUnit: price!.idUnit, idUnitBase: product.idBaseUnit }
        );
        if (!equivalency) return undefined;
        amount = equivalency.equivalency * detail.amount;
      }
      return { idProduct: product!.id, amount: amount };
    }
    const pros = details.map(async detail => {
      const existence = await sync(detail);
      this._inventory.reduceExistence(existence!.idProduct as number, existence!.amount);
    });
    await firstValueFrom(forkJoin(pros));
  }
}
