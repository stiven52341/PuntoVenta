import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  IonContent,
  IonHeader,
  IonLabel,
  IonIcon,
  IonInput,
  IonFooter,
  IonToolbar,
  IonButton,
  IonSelect,
  IonSelectOption,
} from "@ionic/angular/standalone";
import { HeaderBarComponent } from "src/app/components/elements/header-bar/header-bar.component";
import { addIcons } from "ionicons";
import { trash, camera, search } from "ionicons/icons";
import { ICart } from "src/app/models/cart.model";
import { LocalCartService } from "src/app/services/local/local-cart/local-cart.service";
import { IUnitProduct } from "src/app/models/unit-product.model";
import { IProduct } from "src/app/models/product.model";
import { PhotosService } from "src/app/services/photos/photos.service";
import { PhotoKeys, States } from "src/app/services/constants";
import { distinctUntilChanged, firstValueFrom, forkJoin } from "rxjs";
import { ToastService } from "src/app/services/toast/toast.service";
import { AlertsService } from "src/app/services/alerts/alerts.service";
import { FilesService } from "src/app/services/files/files.service";
import { IPurchaseDetail } from "src/app/models/purchase-detail.model";
import { IPurchase } from "src/app/models/purchase.model";
import { PurchaseService } from "src/app/services/api/purchase/purchase.service";
import { LocalPurchaseService } from "src/app/services/local/local-purchase/local-purchase.service";
import { IUnit } from "src/app/models/unit.model";
import { PrintingService } from "src/app/services/printing/printing.service";
import { LocalInventoryService } from "src/app/services/local/local-inventory/local-inventory.service";
import { LocalUnitProductsService } from "src/app/services/local/local-unit-products/local-unit-products.service";
import { LocalProductsService } from "src/app/services/local/local-products/local-products.service";
import { LocalUnitBaseService } from "src/app/services/local/local-unit-base/local-unit-base.service";
import { ErrorsService } from "src/app/services/api/errors/errors.service";
import { LocalCashBoxService } from "src/app/services/local/local-cash-box/local-cash-box.service";
import { IClient } from "src/app/models/client.model";
import { ModalsService } from "src/app/services/modals/modals.service";
import { LocalClientService } from "src/app/services/local/local-client/local-client.service";
import { IBill } from "src/app/models/bill.model";
import { BillsService } from "src/app/services/api/bills/bills.service";
import { LocalBillsService } from "src/app/services/local/bills/bills.service";

export interface IProductCart {
  product: IProduct;
  price: IUnitProduct;
  unit: IUnit;
  amount: number;
  photo?: string;
}

@Component({
  selector: "app-cart",
  templateUrl: "./cart.page.html",
  styleUrls: ["./cart.page.scss"],
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
    IonSelect,
    IonSelectOption
  ],
})
export class CartPage implements OnInit {
  protected loading: boolean = false;
  protected cart?: ICart;
  protected products: Array<IProductCart> = [];
  private readonly noImage: string = "../../../assets/no-image.png";
  private readonly loadingImage: string = "../../../assets/icon/loading.gif";
  protected client?: IClient;
  protected sellType: 'spot' | 'credit' = 'spot';

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
    private _unitBase: LocalUnitBaseService,
    private _error: ErrorsService,
    private _cash: LocalCashBoxService,
    private _modal: ModalsService,
    private _localClient: LocalClientService,
    private _localBill: LocalBillsService
  ) {
    addIcons({ trash, camera, search });
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
        complete: () => this.loading = false
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
      this._photo
        .getPhoto(product.product.id.toString(), PhotoKeys.PRODUCTS_ALBUMN)
        .then((photo) => {
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
        "NO PUEDE REMOVER UN PRODUCTO MIENTRAS SE ESTÁ CARGANDO"
      );
      return;
    }

    if (
      !(await this._alert.showConfirm(
        "CONFIRME",
        "¿Está seguro de remover este artículo del carrito?"
      ))
    )
      return;

    this.loading = true;
    await this._cart.removeProduct(product.product);
    this.loading = false;
  }

  protected async onSave() {
    if (this.cart?.products == undefined || this.cart.products.length == 0) {
      this._alert.showError("El carrito está vacío");
      return;
    }

    const disabledProduct = this.cart.products.filter(product => !product.product.state);
    if (disabledProduct.length > 0) {
      let str = 'Los productos ';
      disabledProduct.forEach((product, index) => {
        str += `<b>${product.product.name}</b>`;
        if (index < disabledProduct.length - 1) str = ", ";
      });
      str += ' están desactivados.';
      this._alert.showError(str);
      return;
    }

    if (!await this._cash.getOpenedCashbox()) {
      await this._alert.showWarning('La caja está cerrada');
    }

    if (this.client) {
      if (this.client.balance >= this.client.maxCredit) {
        if (!await this._alert.showConfirm(undefined, `
        El cliente <b>${this.client.name}</b> ya ha sobrepasado su límite de crédito.<br>
        <b>Balance:</b> $${this.client.balance.toFixed(2)}<br>
        <b>Límite de crédito:</b> $${this.client.maxCredit.toFixed(2)}<br>
        ¿Está seguro de registrar la compra?
      `)) return;
      } else {
        if (!await this._alert.showConfirm(undefined, '¿Está seguro de registrar la compra?')) return;
      }
    }else{
      if (!await this._alert.showConfirm(undefined, '¿Está seguro de registrar la compra?')) return;
    }

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
        id: await this._localPurchase.getNextID(),
        uploaded: States.NOT_INSERTED,
        idClient: this.client?.id,
        isCredit: this.sellType == 'credit',
        isPaid: this.sellType == 'spot'
      };

      let newBill: IBill | undefined;
      if (this.sellType == 'credit') {
        newBill = {
          id: purchase.id as number,
          balance: 0,
          state: true,
          total: purchase.total,
          uploaded: States.NOT_INSERTED
        };
      }


      const save = async (purchase: IPurchase) => {
        const result = await this._purchase.insert(purchase).catch((err) => {
          this._file.saveError(err);
          this._toast.showToast(
            "ERROR AL REGISTRAR LA COMPRA EN LA BASE DE DATOS"
          );
        });

        purchase.uploaded = result ? States.SYNC : States.NOT_INSERTED;

        const updateClient = async () => {
          if (!this.client || this.sellType != 'credit') return;
          this.client.balance += purchase.total;
          await this._localClient.update(this.client);
        }

        const saveBill = async (bill?: IBill) => {
          if(!bill) return;
          await this._localBill.insert(bill);
        }

        await firstValueFrom(
          forkJoin([
            this._localPurchase.insert(purchase),
            this.updateInventory(purchaseDetails),
            updateClient(),
            saveBill(newBill)
          ])
        )
          .then(async () => {
            this._alert.showSuccess("COMPRA REGISTRADA");
            this._cart.resetCart();
            this.client = undefined;
            this.sellType = 'spot';
            this._printing.printPurchase(purchase, purchaseDetails);
          })
          .catch((err) => {
            this._file.saveError(err);
            this._toast.showToast("ERROR AL REGISTRAR LA COMPRA DE FORMA LOCAL");
            this._alert.showError(err);
            this._error.saveErrors(err);
          });
      };

      this.loading = true;
      await save(purchase);
      this.loading = false;
  }
  private async updateInventory(details: Array<IPurchaseDetail>) {
    const sync = async (detail: IPurchaseDetail) => {
      const price = await this._unitProduct.get(
        detail.id.idUnitProductCurrency
      );
      if (!price) return undefined;
      const product = await this._product.get(price.idProduct);

      let amount = detail.amount;
      if (product?.idBaseUnit && price!.idUnit != product.idBaseUnit) {
        const equivalency = await this._unitBase.get({
          idUnit: price!.idUnit,
          idUnitBase: product.idBaseUnit,
        });
        if (!equivalency) return undefined;
        amount = equivalency.equivalency * detail.amount;
      }
      return { idProduct: product!.id, amount: amount };
    };
    const pros = details.map(async (detail) => {
      const existence = await sync(detail);
      if (!existence) return;
      this._inventory.reduceExistence(
        existence.idProduct as number,
        existence.amount
      );
    });
    await firstValueFrom(forkJoin(pros));
  }

  protected async onSearchClients() {
    this.client = await this._modal.showClientsList();

    if (!this.client) return;
    if (this.client.balance >= this.client.maxCredit) {
      this._alert.showWarning(`
        El cliente <b>${this.client.name}</b> ya ha sobrepasado su límite de crédito.<br>
        <b>Balance:</b> $${this.client.balance.toFixed(2)}<br>
        <b>Límite de crédito:</b> $${this.client.maxCredit.toFixed(2)}
      `);
    }
  }
}
