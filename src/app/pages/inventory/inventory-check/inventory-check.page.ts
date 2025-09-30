import { Component, EventEmitter, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonBadge, IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { bookmark, list, save, search } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { States } from 'src/app/services/constants';
import { IInventoryCheckDetail } from 'src/app/models/inventory-check-detail.model';
import { IInventoryCheck } from 'src/app/models/inventory-check.model';
import { IProduct } from 'src/app/models/product.model';
import { IUnitBase } from 'src/app/models/unit-base-product.model';
import { IUnit } from 'src/app/models/unit.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { InventoryCheckService } from 'src/app/services/api/inventory-check/inventory-check.service';
import { LocalInventoryCheckDetailsService } from 'src/app/services/local/local-inventory-check-details/local-inventory-check-details.service';
import { LocalInventoryCheckService } from 'src/app/services/local/local-inventory-check/local-inventory-check.service';
import { LocalInventoryService } from 'src/app/services/local/local-inventory/local-inventory.service';
import { LocalUnitBaseService } from 'src/app/services/local/local-unit-base/local-unit-base.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { ToastService } from 'src/app/services/toast/toast.service';
import { InventoryCheckCartService } from 'src/app/services/local/inventory-check-cart/inventory-check-cart.service';

@Component({
  selector: 'app-inventory-check',
  templateUrl: './inventory-check.page.html',
  styleUrls: ['./inventory-check.page.scss'],
  standalone: true,
  imports: [
    IonBadge, IonContent, IonHeader, HeaderBarComponent, IonButton,
    IonInput, IonIcon, IonLabel, IonFooter, ReactiveFormsModule
  ]
})
export class InventoryCheckPage implements OnInit {
  protected product?: IProduct;
  protected unit?: IUnit;
  protected baseUnit?: IUnit;
  protected showEquivalency: boolean = false;
  protected equivalency?: IUnitBase;
  protected details: Array<IInventoryCheckDetail> = [];
  protected fabButtons: Array<IButton>;

  protected form: FormGroup;

  private fieldsEvent: EventEmitter<void>;

  constructor(
    private _modal: ModalsService, private _localUnit: LocalUnitsService,
    private _localUnitBase: LocalUnitBaseService, private _alert: AlertsService,
    private _toast: ToastService, private _localInventoryCheck: LocalInventoryCheckService,
    private _inventoryCheck: InventoryCheckService,
    private _localInventoryCheckDetails: LocalInventoryCheckDetailsService,
    private _localInventory: LocalInventoryService,
    private _inventoryCheckCart: InventoryCheckCartService
  ) {
    addIcons({ search, list, bookmark, save });

    this.form = new FormGroup({
      amount: new FormControl<number>(0, [Validators.min(0), Validators.required]),
      equivalency: new FormControl<number>(0, [Validators.min(1)]),
      baseAmount: new FormControl<number>({ value: 0, disabled: true }, [Validators.min(1)])
    });

    this.fieldsEvent = new EventEmitter<void>();

    this.fabButtons = [
      {
        title: 'Limpiar',
        do: async () => {
          const result = await this._alert.showConfirm(
            'CONFIRME', '¿Está seguro de limpiar el formulario?'
          );
          if (!result) return;

          this._alert.showOptions('Confirme', '¿Qué quiere limpiar?', [
            {
              label: 'Actual',
              do: () => {
                this.clear();
              }
            },
            {
              label: 'Todo',
              do: () => {
                this.clear(true, true);
              }
            }
          ]);
        }
      }
    ];
  }

  async ngOnInit() {
    this.fieldsEvent.subscribe(async () => {
      const equivalencyControl = this.form.get('equivalency');
      if (!this.unit || !this.product?.idBaseUnit || Number(this.unit!.id) == Number(this.product.idBaseUnit)) {
        this.showEquivalency = false;
        this.baseUnit = undefined;
        this.equivalency = undefined;
        this.form.get('baseAmount')?.setValue(undefined);
        this.form.get('equivalency')?.setValue(undefined);
        equivalencyControl?.removeValidators(Validators.required);
        this.form.get('baseAmount')?.removeValidators(Validators.required);
        return;
      }
      this.showEquivalency = true;

      const data = await firstValueFrom(forkJoin([
        this._localUnit.get(this.product.idBaseUnit),
        this._localUnitBase.get({ idUnit: this.unit.id as number, idUnitBase: this.product.idBaseUnit })
      ]));


      this.baseUnit = data[0];
      this.equivalency = data[1];
      equivalencyControl?.addValidators(Validators.required);
      equivalencyControl?.setValue(this.equivalency?.equivalency);
      this.form.get('baseAmount')?.addValidators(Validators.required);
    });

    const oldData = await this._inventoryCheckCart.getCurrent();
    this.details = oldData.details;
  }

  protected async selectProduct() {
    const product = await this._modal.showProductListModal();
    if (!product) return;
    this.product = product.product;
    this.fieldsEvent.emit();
  }

  protected async selectUnit() {
    const unit = await this._modal.showUnitsList();
    if (!unit) return;
    this.unit = unit;
    this.fieldsEvent.emit();
  }

  protected async onAdd() {
    if (!this.checkBeforeAdding()) return;
    //if(!await this._alert.showConfirm('CONFIRME', '¿Está seguro de agregar el detalle?')) return;

    const detail: IInventoryCheckDetail = {
      id: {
        idInventoryCheck: 0,
        idProduct: this.product!.id as number,
        idUnit: this.unit!.id as number
      },
      amount: this.form.get('amount')!.value as number,
      amountBaseUnit: (this.form.get('baseAmount')?.value || this.form.get('amount')!.value) as number,
      idBaseUnit: (this.baseUnit?.id || this.unit!.id) as number,
      state: true,
      uploaded: States.NOT_INSERTED,
      equivalencyUsed: this.form.get('equivalency')?.value
    };

    this.details.push(detail);
    this._toast.showToast('Detalle agregado', 2000, 'primary', 'top');
    this.clear();

    const check: IInventoryCheck = {
      id: 1,
      date: new Date(),
      details: this.details,
      state: true,
      uploaded: States.NOT_SYNCABLE
    };
    await this._inventoryCheckCart.insert(check);
  }

  private checkBeforeAdding(): boolean {
    if (!this.product) {
      this._alert.showError('Debe seleccionar un producto');
      return false;
    }

    if (!this.unit) {
      this._alert.showError('Debe seleccionar una unidad');
      return false;
    }

    if (this.form.get('amount')?.invalid) {
      this._alert.showError('Cantidad inválida');
      return false;
    }

    if (this.form.get('equivalency')?.invalid) {
      this._alert.showError('Equivalencia inválida');
      return false;
    }

    if (this.form.get('baseAmount')?.invalid) {
      this._alert.showError('Cantidad en unidad base inválida');
      return false;
    }

    return true;
  }

  protected clear(clearAll: boolean = false, showToast: boolean = false) {
    this.form.reset();
    this.product = undefined;
    this.unit = undefined;
    this.baseUnit = undefined;
    this.fieldsEvent.emit();

    if (clearAll) {
      this.details = [];
      this._inventoryCheckCart.reset();
    }

    if (showToast) {
      if (clearAll) {
        this._toast.showToast('Todos los datos limpiados');
      } else {
        this._toast.showToast('Formulario limpiado');
      }
    }
  }

  protected onList() {
    if (this.details.length == 0) {
      this._alert.showError('No ha agregado detalles');
      return;
    }
    this._modal.showInventoryCheckDetailsList(this.details);
  }

  protected async onFinish() {
    if (this.details.length == 0) {
      this._alert.showError('No ha agregado ningún detalle');
      return;
    }

    if (!await this._alert.showConfirm(
      'CONFIRME', '¿Está seguro de finalizar el pase de inventario?'
    )) return;

    const header: IInventoryCheck = {
      date: new Date(),
      details: this.details,
      id: await this._localInventoryCheck.getNextID(),
      state: true,
      uploaded: States.NOT_INSERTED
    }

    const result = (await this._inventoryCheck.insert(header))
      ? States.SYNC : States.NOT_INSERTED;

    header.details = [];
    header.uploaded = result;
    this.details.map(detail => {
      detail.id.idInventoryCheck = header.id as number;
      detail.uploaded = result;
    });

    const insertDetails = async (details: Array<IInventoryCheckDetail>) => {
      for (const detail of details) {
        await this._localInventoryCheckDetails.insert(detail)
      }
    }

    await firstValueFrom(forkJoin([
      this._localInventoryCheck.insert(header),
      insertDetails(this.details),
      this.updateLocalInventory(this.details)
    ])).then(() => {
      this._alert.showSuccess('Pase de inventario insertado satisfactoriamente');
      this.clear(true);
    }).catch(() => {
      this._alert.showError('Error al insertar pase de inventario');
    });
  }

  private async updateLocalInventory(details: Array<IInventoryCheckDetail>) {
    const pros = details.map(async detail => {
      await this._localInventory.update({
        id: detail.id.idProduct,
        idUnit: detail.idBaseUnit,
        existence: detail.amountBaseUnit!,
        state: detail.state,
        uploaded: detail.uploaded
      });
    });
    await firstValueFrom(forkJoin(pros));
  }
}
