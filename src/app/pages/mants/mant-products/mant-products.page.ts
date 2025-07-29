import { IUnit } from './../../../models/unit.model';
import { ProductCategoryService } from 'src/app/services/api/product-category/product-category.service';
import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonInput,
  IonLabel,
  IonIcon,
  IonFooter,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { IProduct } from 'src/app/models/product.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { PhotosService } from 'src/app/services/photos/photos.service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { LocalProductsService } from 'src/app/services/local/local-products/local-products.service';
import { ProductService } from 'src/app/services/api/product/product.service';
import { FilesService } from 'src/app/services/files/files.service';
import { ImageProductService } from 'src/app/services/api/image-product/image-product.service';
import { IImageProduct } from 'src/app/models/image-product.model';
import { PhotoKeys, States } from 'src/app/models/constants';
import { TitleCasePipe } from '@angular/common';
import { IButton } from 'src/app/models/button.model';
import { ToastService } from 'src/app/services/toast/toast.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { ICategory } from 'src/app/models/category.model';
import { IProductCategory } from 'src/app/models/product-category.model';
import { LocalProductCategoryService } from 'src/app/services/local/local-product-category/local-product-category.service';
import { LocalCategoriesService } from 'src/app/services/local/local-categories/local-categories.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';

@Component({
  selector: 'app-mant-products',
  templateUrl: './mant-products.page.html',
  styleUrls: ['./mant-products.page.scss'],
  standalone: true,
  imports: [
    IonFooter,
    IonIcon,
    IonLabel,
    IonButton,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    IonInput,
    ReactiveFormsModule,
  ],
  providers: [TitleCasePipe],
})
export class MantProductsPage implements OnInit {
  protected image?: string;
  protected loading: boolean = false;
  protected title: string = 'NUEVO PRODUCTO';
  protected state: boolean = true;
  protected category?: ICategory;
  protected baseUnit?: IUnit;

  private readonly noImage = '../../../../assets/no-image.png';

  protected product?: IProduct;
  protected units: Array<IUnit> = [];
  protected headerButtons: Array<IButton>;

  protected form: FormGroup;

  constructor(
    private _photo: PhotosService,
    private _modal: ModalsService,
    private _alert: AlertsService,
    private _localProducts: LocalProductsService,
    private _products: ProductService,
    private _file: FilesService,
    private _imageProduct: ImageProductService,
    private _title: TitleCasePipe,
    private _toast: ToastService,
    private _global: GlobalService,
    private _localProductCategory: LocalProductCategoryService,
    private _productCategory: ProductCategoryService,
    private _localCategories: LocalCategoriesService,
    private _localUnit: LocalUnitsService
  ) {
    addIcons({ search });

    this.form = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50),
      ]),
      desc: new FormControl(null, [Validators.maxLength(150)]),
    });

    this.headerButtons = [
      {
        title: 'LIMPIAR',
        do: async () => {
          await this.clearForm();
        },
      },
    ];
  }

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    this.image = this.noImage;
  }

  protected async onSearchProduct() {
    const result = await this._modal.showProductListModal();
    if (!result) return;
    this.title = 'modificando producto';
    this.product = result.product;

    if (!this.product) return;

    this.image = result.image;

    await this.setForm(this.product);
  }

  protected async onChangePhoto() {
    await this._alert.showOptions(
      'CONFIRME',
      '¿Quiere tomar una foto o seleccionarla de galería?',
      [
        {
          label: 'GALERÍA',
          do: async () => {
            this.loading = true;
            this.image = (await this._photo.openGallery()) || this.noImage;
            this.loading = false;
          },
        },
        {
          label: 'CÁMARA',
          do: async () => {
            this.loading = true;
            this.image = (await this._photo.takePhoto()) || this.noImage;
            this.loading = false;
          },
        },
      ]
    );
  }

  private async setForm(product: IProduct) {
    this.form.get('name')?.setValue(product.name);
    this.form.get('desc')?.setValue(product.description || '');

    this.state = product.state;
    this.baseUnit = await this._localUnit.get(product.baseUnit);

    const productCategory = (await this._localProductCategory.getAll()).find(
      (proCa) => proCa.id.idProduct == product!.id
    );

    if (productCategory) {
      this.category = await this._localCategories.get(
        productCategory!.id.idCategory
      );
    }
  }

  private checkForm(): boolean {
    if (this.form.get('name')?.invalid) {
      this._alert.showError('NOMBRE INVÁLIDO');
      return false;
    }

    if (this.form.get('desc')?.invalid) {
      this._alert.showError('DESCRIPCIÓN INVÁLIDO');
      return false;
    }

    if(!this.baseUnit){
      this._alert.showError('DEBE ELEGIR UNA UNIDAD BASE');
      return false;
    }

    return true;
  }

  public async onSave() {
    if (!this.checkForm()) return;

    if (
      !(await this._alert.showConfirm(
        'CONFIRME',
        '¿Está seguro de guardar los cambios?'
      ))
    )
      return;

    this.loading = true;

    const product: IProduct = {
      id: 0,
      name: this._title.transform(
        (this.form.get('name')!.value as string).trim()
      ),
      description: (this.form.get('desc')?.value || ('' as string)).trim(),
      state: true,
      uploaded: States.NOT_INSERTED,
      baseUnit: this.baseUnit!.id as number
    };

    if (this.product) {
      //MODIFYING
      product.id = this.product.id;

      await this.syncCategory(product);

      const response = (await this._products.update(product))
        ? States.SYNC
        : States.NOT_UPDATED;
      let photoInserted: boolean | undefined;

      if (response && this.image != this.noImage) {
        photoInserted = await this._imageProduct.update({
          id: product.id,
          data: this.image!,
          state: true,
          uploaded: States.SYNC,
        });
      }

      product.uploaded = response;
      const image: IImageProduct = {
        id: product.id,
        data: this.image!,
        uploaded: photoInserted ? States.SYNC : States.NOT_UPDATED,
        state: true,
      };

      await this._localProducts
        .update(product)
        .then(async () => {
          if (this.image != this.noImage) {
            await this._photo.savePhoto(
              image.id.toString(),
              image.data,
              PhotoKeys.PRODUCTS_ALBUMN
            );
          }

          this._alert.showSuccess('PRODUCTO MODIFICADO');
          this._global.updateData();
          this.clearForm(false);
        })
        .catch((err) => {
          this._file.saveError(err);
          this._alert.showError(
            'ERROR MODIFICANDO PRODUCTO. CONTACTE AL SERVICIO TÉCNICO'
          );
        });
    } else {
      //NEW
      product.id = await this._localProducts.getNextID();
      const response = await this._products.insert(product);
      await this.syncCategory(product);
      let photoInserted: string | number | Object | undefined;

      if (response && this.image != this.noImage) {
        photoInserted = await this._imageProduct.insert({
          id: response as number,
          data: this.image!.replace('data:image/png;base64,', ''),
          state: true,
          uploaded: States.SYNC,
        });
      }

      product.uploaded = response ? States.SYNC : States.NOT_INSERTED;
      const image: IImageProduct = {
        id: product.id,
        data: this.image!,
        uploaded: photoInserted ? States.SYNC : States.NOT_INSERTED,
        state: true,
      };

      this._localProducts
        .insert(product)
        .then(async () => {
          if (this.image != this.noImage) {
            await this._photo.savePhoto(
              image.id.toString(),
              image.data,
              PhotoKeys.PRODUCTS_ALBUMN
            );
          }

          this._alert.showSuccess('PRODUCTO CREADO');
          this._global.updateData();
          this.clearForm(false);
        })
        .catch((err) => {
          this._file.saveError(err);
          console.log(err);
          this._alert.showError(
            'ERROR CREANDO PRODUCTO. CONTACTE AL SERVICIO TÉCNICO'
          );
        });
    }

    this.loading = false;
  }

  protected async onDeactivateProduct() {
    if (!this.product) return;
    const confirmText = this.product.state
      ? '¿Está seguro de desactivar el producto?'
      : '¿Está seguro de activar el producto?';

    if (!(await this._alert.showConfirm('CONFIRME', confirmText))) return;

    this.loading = true;
    if (this.product.state) {
      await this._products
        .delete(this.product)
        .then((r) => {
          console.log('Product deleted');
          this.product!.uploaded = States.SYNC;
        })
        .catch((err) => {
          this._file.saveError(err);
          this.product!.uploaded = States.NOT_DELETED;
        });
      await this._localProducts
        .deactivate(this.product)
        .then(() => {
          this._alert.showSuccess('PRODUCTO DESACTIVADO');
          this._global.updateData();
        })
        .catch((err) => {
          this._alert.showSuccess('ERROR DESACTIVANDO PRODUCTO');
          this._file.saveError(err);
        });
    } else {
      this.product.state = true;

      await this._products
        .update(this.product)
        .then((r) => {
          console.log('Product deleted');
          this.product!.uploaded = States.SYNC;
        })
        .catch((err) => {
          this._file.saveError(err);
          this.product!.uploaded = States.NOT_UPDATED;
        });

      await this._localProducts
        .update(this.product)
        .then(() => {
          this._alert.showSuccess('PRODUCTO ACTIVADO');
          this._global.updateData();
        })
        .catch((err) => {
          this._alert.showSuccess('ERROR DESACTIVANDO PRODUCTO');
          this._file.saveError(err);
        });
    }

    this.loading = false;
  }

  private async clearForm(showConfirm: boolean = true) {
    if (showConfirm) {
      if (
        !(await this._alert.showConfirm(
          'CONFIRME',
          '¿Está seguro de limpiar el formulario?'
        ))
      )
        return;
    }

    this.image = this.noImage;
    this.form.reset();
    this.title = 'NUEVO PRODUCTO';
    this.product = undefined;
    this.baseUnit = undefined;
    this.category = undefined;

    this._toast.showToast('Formulario limpiado', 2000, 'primary', 'top');
  }

  protected async onSearchCategory() {
    const result = await this._modal.showCategoriesList(false);
    if (result) {
      this.category = result.category;
    }
  }

  private async syncCategory(product: IProduct) {
    if (!this.category) return;

    const productCategory: IProductCategory = {
      id: {
        idCategory: this.category.id as number,
        idProduct: product.id as number,
      },
      state: true,
      uploaded: States.NOT_INSERTED,
    };

    const result = (await this._productCategory.insert(productCategory))
      ? States.SYNC
      : States.NOT_INSERTED;
    productCategory.uploaded = result;

    await this._localProductCategory.insert(productCategory).catch((err) => {
      throw err;
    });
  }

  protected async searchUnit(){
    const result = await this._modal.showUnitsList();
    if(result) this.baseUnit = result;
  }
}
