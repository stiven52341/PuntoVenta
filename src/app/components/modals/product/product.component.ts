import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  IonContent,
  IonHeader,
  IonButton,
  IonIcon,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  Platform,
  ModalController,
  IonImg,
} from "@ionic/angular/standalone";
import { HeaderBarComponent } from "../../elements/header-bar/header-bar.component";
import { IProduct } from "src/app/models/product.model";
import { DecimalPipe, UpperCasePipe } from "@angular/common";
import { IProductCategory } from "src/app/models/product-category.model";
import { LocalCategoriesService } from "src/app/services/local/local-categories/local-categories.service";
import { ICategory } from "src/app/models/category.model";
import { addIcons } from "ionicons";
import { heart, shareSocial, camera } from "ionicons/icons";
import { FormsModule } from "@angular/forms";
import { IUnitProduct } from "src/app/models/unit-product.model";
import { LocalUnitProductsService } from "src/app/services/local/local-unit-products/local-unit-products.service";
import { firstValueFrom, forkJoin, Subscription } from "rxjs";
import { LocalUnitsService } from "src/app/services/local/local-units/local-units.service";
import { IUnit } from "src/app/models/unit.model";
import { LocalCartService } from "src/app/services/local/local-cart/local-cart.service";
import { AlertsService } from "src/app/services/alerts/alerts.service";
import { ToastService } from "src/app/services/toast/toast.service";
import { LocalInventoryService } from "src/app/services/local/local-inventory/local-inventory.service";
import { LocalProductsService } from "src/app/services/local/local-products/local-products.service";
import { GlobalService } from "src/app/services/global/global.service";
import { PhotosService } from "src/app/services/photos/photos.service";
import { PhotoKeys } from "src/app/services/constants";
import { LocalProductCategoryService } from "src/app/services/local/local-product-category/local-product-category.service";
import { FilesService } from "src/app/services/files/files.service";

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html",
  styleUrls: ["./product.component.scss"],
  standalone: true,
  imports: [
    UpperCasePipe,
    IonLabel,
    DecimalPipe,
    FormsModule,
    IonIcon,
    IonInput,
    IonButton,
    IonHeader,
    HeaderBarComponent,
    IonContent,
    IonSelect,
    IonSelectOption,
    IonImg
  ],
})
export class ProductComponent implements OnInit, OnDestroy {
  @Input({ required: true }) product?: IProduct;
  @Input() image?: string;
  @Input() productCategories?: Array<IProductCategory> = [];
  @Input() defaultAmount?: number;
  @Input() defaultPrice?: IUnitProduct;
  @ViewChild('amount', { static: false }) amountInput!: IonInput;
  @Input() type: 'normal' | 'order' = 'normal';

  protected prices: Array<{ unitPro: IUnitProduct; unit: IUnit }> = [];
  protected selectedPrice?: number;
  protected addButtonLabel: string = "Añadir al carrito".toUpperCase();
  protected cantidad?: number;
  protected categories: Array<ICategory> = [];
  protected existence: number = 0;
  protected baseUnit?: IUnit;
  protected loading: boolean = false;
  protected showCartButton: boolean = true;

  private subs: Array<Subscription> = [];

  constructor(
    private _categories: LocalCategoriesService,
    private _prices: LocalUnitProductsService,
    private _unit: LocalUnitsService,
    private _cart: LocalCartService,
    private _alert: AlertsService,
    private _toast: ToastService,
    private _invetory: LocalInventoryService,
    private _product: LocalProductsService,
    private _global: GlobalService,
    private _platform: Platform,
    private _modalCtrl: ModalController,
    private _photo: PhotosService,
    private _productCategories: LocalProductCategoryService,
    private _file: FilesService
  ) {
    addIcons({ heart, shareSocial, camera });
  }

  async ngOnInit() {
    const backHandler = this._platform.backButton.subscribeWithPriority(10, async () => {
      const topModal = await this._modalCtrl.getTop();
      if (topModal) {
        await topModal.dismiss();
      }
    });
    this.subs.push(backHandler);

    const data = await firstValueFrom(
      forkJoin([
        this._categories.getAll(),
        this._prices.getAll(),
        this._unit.getAll(),
        this._invetory.get(this.product!.id as number),
      ])
    );

    if (!this.image) {
      this.image = "../../assets/icon/loading.gif";
      this._photo.getPhoto(this.product!.id.toString(), PhotoKeys.PRODUCTS_ALBUMN).then(photo => {
        this.image = photo || '../../assets/icon/no-image.png';
      });
    }

    if (!this.categories || this.categories.length == 0) {
      this._productCategories
        .getCategoriesByProduct(this.product!.id as number)
        .then(categories => this.categories = categories)
        .catch(err => {
          this._toast.showToast('Error obteniendo categorías', undefined, 'danger');
          console.error('Error con categorias', err);
          this._file.saveError(err);
        });
    }

    if (this.productCategories && this.productCategories.length > 0) {
      this.categories = data[0].filter((category) => {
        return this.productCategories?.some(
          (pc) => pc.id.idCategory == category.id
        );
      });
    }

    if (this.defaultAmount) {
      this.cantidad = this.defaultAmount;
      this.amountInput.setFocus();
    }

    data[1].forEach((unitProduct) => {
      if (unitProduct.idProduct == this.product!.id && unitProduct.state) {
        const unit = data[2].find((unit) => unit.id == unitProduct.idUnit);
        if (unit) {
          this.prices.push({
            unitPro: unitProduct,
            unit: unit,
          });
        }
      }
    });
    this.selectedPrice =
      (this.prices.find((price) => price.unitPro.isDefault)?.unitPro
        .id as number) || (this.prices[0].unitPro.id as number);

    if (data[3]) {
      this.existence = data[3].existence || 0;
      this.baseUnit = await this._unit.get(data[3].idUnit);
    }
    setTimeout(() => this.amountInput.setFocus(), 300);

    if (this.defaultPrice) {
      this.selectedPrice = +this.defaultPrice!.id;
      console.log('Selected price', this.selectedPrice);
    }

    if(this.type == 'order'){
      this.showCartButton = false;
      if(this.defaultPrice){
        this.addButtonLabel = "Modificar detalle".toUpperCase();
      }else{
        this.addButtonLabel = "Agregar al pedido".toUpperCase();
      }
    }
  }

  ngOnDestroy(): void {
    this.subs.map(sub => sub.unsubscribe());
  }

  protected getTotal() {
    return (
      (this.prices.find((p) => p.unitPro.id == this.selectedPrice)?.unitPro
        .price || 0) * (this.cantidad || 0)
    );
  }

  private async check(unit: IUnit): Promise<boolean> {
    if (!this.cantidad || this.cantidad <= 0) {
      await this._alert.showError("CANTIDAD INVÁLIDA");
      return false;
    }
    if (
      !this.selectedPrice ||
      this.selectedPrice == 0 ||
      !this.prices.some((price) => price.unitPro.id == this.selectedPrice)
    ) {
      await this._alert.showError("PRECIO INVÁLIDO");
      return false;
    }

    if (!unit.allowDecimals) {
      if (!Number.isInteger(this.cantidad)) {
        await this._alert.showError(
          "LA UNIDAD SELECCIONADA NO PERMITE DECIMALES"
        );
        return false;
      }
    }

    return true;
  }

  protected async onAddProduct() {
    if (this.prices.length == 0) {
      await this._alert.showError(
        "NO HAY PRECIOS REGISTRADOS PARA ESTE PRODUCTO"
      );
      return;
    }

    const price = this.prices.find(
          (price) => price.unitPro.id == this.selectedPrice
        )!.unitPro;

    const save = async () => {
      this.loading = true;
      try {
        
        const unit = await this._unit.get(price.idUnit);
        if (!unit) {
          this._alert.showError("No se encontró la unidad seleccionada");
          return;
        }
        if (!(await this.check(unit))) return;

        await this._cart.addProduct(this.product!, this.cantidad!, price);
      } catch (error) {
        console.error('Error adding product to cart', error);
      } finally {
        this.loading = false;
        this._toast.showToast("PRODUCTO AGREGADO", 1000);
      }
    }
    const modifyOrder = async () => {
      await this._modalCtrl.dismiss(
        { product: this.product, price, amount: this.cantidad },
        undefined, 'product-detail-modal'
      );
    }

    switch(this.type){
      case 'normal':
        await save();
        break;
      case 'order':
        await modifyOrder();
        break;
    }

  }

  protected async setFavorite() {
    if (!this.product) return;
    this.product.isFavorite = this.product?.isFavorite ? false : true;
    await this._product
      .update(this.product)
      .then(() => {
        this._global.updateData();
      })
      .catch(() => {
        this._alert.showError("Error marcando producto como favorito");
      });
  }
}
