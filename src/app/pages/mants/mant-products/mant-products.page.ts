import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonButton,
  IonInput, IonLabel } from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { IProduct } from 'src/app/models/product.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { PhotosService } from 'src/app/services/photos/photos.service';
import { IUnit } from 'src/app/models/unit.model';
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
import { firstValueFrom, forkJoin } from 'rxjs';
import { PhotoKeys } from 'src/app/models/constants';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-mant-products',
  templateUrl: './mant-products.page.html',
  styleUrls: ['./mant-products.page.scss'],
  standalone: true,
  imports: [IonLabel,
    IonButton,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    IonInput,
    ReactiveFormsModule,
  ],
})
export class MantProductsPage implements OnInit {
  protected image?: string;
  protected loading: boolean = false;
  protected title: string = 'NUEVO PRODUCTO';
  protected state: boolean = true;

  private readonly noImage = '../../../../assets/no-image.png';

  protected product?: IProduct;
  protected units: Array<IUnit> = [];

  protected form: FormGroup;

  constructor(
    private _photo: PhotosService,
    private _modal: ModalsService,
    private _alert: AlertsService,
    private _localProducts: LocalProductsService,
    private _products: ProductService,
    private _file: FilesService,
    private _imageProduct: ImageProductService
  ) {
    this.form = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50),
      ]),
      desc: new FormControl(null, [Validators.maxLength(150)]),
      active: new FormControl(true, []),
    });
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

    this.setForm(this.product);
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

  private setForm(product: IProduct) {
    this.form.get('name')?.setValue(product.name);
    this.form.get('desc')?.setValue(product.description || '');

    this.state = product.state;
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
    return true;
  }

  public async onSave() {
    if (!this.checkForm()) return;

    this.loading = true;

    const product: IProduct = {
      id: 0,
      name: (this.form.get('name')!.value as string).trim(),
      description: (this.form.get('desc')!.value as string).trim(),
      state: Boolean(this.form.get('active')!.value),
    };

    if (this.product) {
      //MODIFYING
      product.id = this.product.id;

      const response = await this._products.update(product);
      let photoInserted: boolean | undefined;

      if(response && this.image != this.noImage){
        photoInserted = await this._imageProduct.update({
          id: product.id,
          image: this.image!.replace('data:image/png;base64,','')
        });
      }

      product.uploaded = response;
      const image: IImageProduct = {
        id: product.id,
        image: this.image!,
        uploaded: photoInserted || false
      };

      await firstValueFrom(forkJoin([
        this._localProducts.update(product),
        this._photo.savePhoto(image.id.toString(), image.image, PhotoKeys.PRODUCTS_ALBUMN)
      ])).then(() => {
        this._alert.showSuccess('PRODUCTO MODIFICADO');
        AppComponent.loadingData.emit(false);
      }).catch(err => {
        this._file.saveError(err);
        this._alert.showError('ERROR MODIFICANDO PRODUCTO. CONTACTE AL SERVICIO TÉCNICO');
      });
    } else {
      //NEW
      product.id = await this._localProducts.getNextID();
      const response = await this._products.insert(product);
      let photoInserted: string | number | Object | undefined;

      if(response && this.image != this.noImage){
        photoInserted = await this._imageProduct.insert({
          id: response as number,
          image: this.image!.replace('data:image/png;base64,','')
        });
      }

      product.uploaded = response ? true : false;
      const image: IImageProduct = {
        id: product.id,
        image: this.image!,
        uploaded: photoInserted ? true : false
      };

      await firstValueFrom(forkJoin([
        this._localProducts.insert(product),
        this._photo.savePhoto(image.id.toString(), image.image, PhotoKeys.PRODUCTS_ALBUMN)
      ])).then(() => {
        this._alert.showSuccess('PRODUCTO CREADO');
        AppComponent.loadingData.emit(false);
      }).catch(err => {
        this._file.saveError(err);
        this._alert.showError('ERROR CREANDO PRODUCTO. CONTACTE AL SERVICIO TÉCNICO');
      });
    }

    this.loading = false;
  }
}
