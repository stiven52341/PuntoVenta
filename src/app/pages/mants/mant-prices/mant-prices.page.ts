import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonInput,
  IonButton,
  IonIcon,
  IonFooter,
  IonLabel,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { IProduct } from 'src/app/models/product.model';
import { FormsModule } from '@angular/forms';
import { IUnit } from 'src/app/models/unit.model';
import { IUnitProduct } from 'src/app/models/unit-product.model';
import { LocalUnitProductsService } from 'src/app/services/local/local-unit-products/local-unit-products.service';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { UnitProductService } from 'src/app/services/api/unit-product/unit-product.service';
import { FilesService } from 'src/app/services/files/files.service';
import { IButton } from 'src/app/models/button.model';
import { States } from 'src/app/models/constants';
import { GlobalService } from 'src/app/services/global/global.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-mant-prices',
  templateUrl: './mant-prices.page.html',
  styleUrls: ['./mant-prices.page.scss'],
  standalone: true,
  imports: [
    IonCheckbox,
    IonLabel,
    IonFooter,
    IonIcon,
    IonButton,
    IonInput,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    FormsModule,
  ],
  providers: [TitleCasePipe]
})
export class MantPricesPage implements OnInit {
  protected loading: boolean = false;
  protected product?: IProduct;
  protected unit?: IUnit;
  protected prices: Array<IUnitProduct> = [];
  protected showPrices: boolean = false;
  protected selectedPrice?: IUnitProduct;
  protected defaultPrice: boolean = false;
  protected headerButtons: Array<IButton>;
  protected label?: string;

  private fieldsFullfilled: EventEmitter<void>;

  @ViewChild('price', { static: true }) priceInput!: IonInput;

  constructor(
    private _modal: ModalsService,
    private _localPrices: LocalUnitProductsService,
    private _alert: AlertsService,
    private _prices: UnitProductService,
    private _file: FilesService,
    private _global: GlobalService,
    private _title: TitleCasePipe
  ) {
    addIcons({ search });

    this.fieldsFullfilled = new EventEmitter<void>();

    this.headerButtons = [
      {
        title: 'LIMPIAR',
        do: async () => {
          await this.cleanForm();
        },
      },
    ];
  }

  ngOnInit() {
    this.fieldsFullfilled.subscribe(async () => {
      this.loading = true;
      this.prices = (await this._localPrices.getAll()).filter(
        (price) =>
          +price.idProduct == +this.product!.id &&
          +price.idUnit == +this.unit!.id
      );
      this.prices.length > 0
        ? (this.showPrices = true)
        : (this.showPrices = false);
      this.loading = false;
    });
  }

  protected async onSearchProduct() {
    const result = (await this._modal.showProductListModal())?.product;
    if (!result) return;

    this.product = result;
    if (this.unit) this.fieldsFullfilled.emit();
  }

  protected async onSearchUnit() {
    const result = await this._modal.showUnitsList();
    if (!result) return;

    this.unit = result;
    if (this.product) this.fieldsFullfilled.emit();
  }

  protected async onSearchPrice() {
    const result = await this._modal.showPrices(this.prices);
    if (!result) return;

    this.selectedPrice = result;
    this.priceInput.value = result.price;
    this.defaultPrice = result.isDefault;
  }

  protected checkForm(): boolean {
    if (!this.product) {
      this._alert.showError('Debe seleccionar un producto');
      return false;
    }

    if (!this.unit) {
      this._alert.showError('Debe seleccionar una unidad');
      return false;
    }

    if (!this.priceInput.value || Number(this.priceInput.value) <= 0) {
      this._alert.showError('El precio debe ser mayor a 0');
      return false;
    }

    if(this.label && this.label.length > 50){
      this._alert.showError('Etiqueta inválida');
      return false;
    }

    return true;
  }

  protected async onSave() {
    if (!this.checkForm()) return;

    const newPrice: IUnitProduct = {
      id: await this._localPrices.getNextID(),
      idCurrency: 1,
      amount: 0,
      cost: Number(this.priceInput.value),
      price: Number(this.priceInput.value),
      idProduct: this.product!.id,
      idUnit: this.unit!.id,
      isDefault: this.defaultPrice,
      state: true,
      uploaded: States.NOT_INSERTED,
      label: this._title.transform(this.label ? this.label : '')
    };

    if (!this.selectedPrice) {
      if (
        !(await this._alert.showConfirm(
          'CONFIRME',
          '¿Está seguro de guardar el nuevo precio?'
        ))
      )
        return;

      this.loading = true;
      const updated = (await this._prices.insert(newPrice)) ? true : false;

      newPrice.uploaded = updated ? States.SYNC : States.NOT_INSERTED;
      await this._localPrices
        .insert(newPrice)
        .then(() => {
          this._alert.showSuccess('Precio guardado');
          this.cleanForm(false);
        })
        .catch((err) => {
          this._alert.showError('Error al guardar el nuevo precio');
          this._file.saveError(err);
        });
      this.loading = false;
    } else {
      if (
        !(await this._alert.showConfirm(
          'CONFIRME',
          '¿Está seguro de modificar el precio seleccionado?'
        ))
      )
        return;

      this.loading = true;
      newPrice.id = this.selectedPrice.id;
      const updated = (await this._prices.update(newPrice)) ? true : false;
      newPrice.uploaded = updated ? States.SYNC : States.NOT_UPDATED;
      await this._localPrices
        .update(newPrice)
        .then(() => {
          this._alert.showSuccess('Precio actualizado');
          this._global.updateData();
          this.cleanForm(false);
        })
        .catch((err) => {
          this._alert.showError('Error al actualizar el precio');
          this._file.saveError(err);
        });
      this.loading = false;
    }
  }

  protected async onDeactivate() {
    if (!this.selectedPrice) return;

    const text = this.selectedPrice.state
      ? '¿Está seguro de desactivar este precio?'
      : '¿Está seguro de activar este precio?';
    if (!(await this._alert.showConfirm('CONFIRME', text))) return;

    const deactivate = async (price: IUnitProduct) => {
      price.state = false;
      let result = false;
      await this._prices
        .delete(price)
        .then((r) => {
          if (r) result = true;
        })
        .catch((err) => {
          this._file.saveError(err);
        });

      price.uploaded = result ? States.SYNC : States.NOT_DELETED;
      await this._localPrices
        .deactivate(price)
        .then(() => {
          this._alert.showSuccess('Precio desactivado');
          this._global.updateData();
        })
        .catch((err) => {
          this._alert.showError('ERROR DESACIVANDO PRECIO');
          this._file.saveError(err);
        });
    };

    const activate = async (price: IUnitProduct) => {
      price.state = true;
      let result = false;
      await this._prices
        .update(price)
        .then((r) => {
          if (r) result = true;
        })
        .catch((err) => {
          this._file.saveError(err);
        });

      price.uploaded = result ? States.SYNC : States.NOT_UPDATED;
      await this._localPrices
        .update(price)
        .then(() => {
          this._alert.showSuccess('Precio activado');
          this._global.updateData();
        })
        .catch((err) => {
          this._alert.showError('ERROR ACTIVANDO PRECIO');
          this._file.saveError(err);
        });
    };

    this.loading = true;
    if (this.selectedPrice.state) {
      await deactivate(this.selectedPrice);
    } else {
      await activate(this.selectedPrice);
    }
    this.loading = false;
  }

  private async cleanForm(showConfirm: boolean = true) {
    if (showConfirm) {
      if (
        !(await this._alert.showConfirm(
          'CONFIRME',
          '¿Está seguro de limpiar este formulario?'
        ))
      )
        return;
    }

    this.product = undefined;
    this.unit = undefined;
    this.priceInput.value = 0;
    this.defaultPrice = false;
    this.selectedPrice = undefined;
    this.showPrices = false;
    this.prices = [];
  }
}
