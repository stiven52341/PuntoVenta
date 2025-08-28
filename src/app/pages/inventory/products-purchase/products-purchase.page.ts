import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonFooter,
  IonButton,
  IonLabel,
  IonIcon,
  IonBadge,
  IonInput,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { list, save, search, bookmark } from 'ionicons/icons';
import { debounceTime, firstValueFrom, forkJoin } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { States } from 'src/app/models/constants';
import { IInventoryIncomeDetail } from 'src/app/models/inventory-income-detail.model';
import { IInventoryIncome } from 'src/app/models/inventory-income.model';
import { IProduct } from 'src/app/models/product.model';
import { IUnitBase } from 'src/app/models/unit-base-product.model';
import { IUnit } from 'src/app/models/unit.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { InventoryIncomeService } from 'src/app/services/api/inventory-income/inventory-income.service';
import { UnitBaseService } from 'src/app/services/api/unit-base/unit-base.service';
import { LocalInventoryIncomeDetailService } from 'src/app/services/local/local-inventory-income-detail/local-inventory-income-detail.service';
import { LocalInventoryIncomeService } from 'src/app/services/local/local-inventory-income/local-inventory-income.service';
import { LocalInventoryService } from 'src/app/services/local/local-inventory/local-inventory.service';
import { LocalUnitBaseService } from 'src/app/services/local/local-unit-base/local-unit-base.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { ToastService } from 'src/app/services/toast/toast.service';

@Component({
  selector: 'app-products-purchase',
  templateUrl: './products-purchase.page.html',
  styleUrls: ['./products-purchase.page.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonBadge,
    IonIcon,
    IonLabel,
    IonFooter,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    IonButton,
    ReactiveFormsModule,
  ],
})
export class ProductsPurchasePage implements OnInit {
  protected fabOptions: Array<IButton>;

  protected product?: IProduct;
  protected unit?: IUnit;
  protected baseUnit?: IUnit;

  protected form: FormGroup;
  protected showEquivalency: boolean = false;

  protected details: Array<IInventoryIncomeDetail> = [];

  constructor(
    private _modal: ModalsService,
    private _unit: LocalUnitsService,
    private _alert: AlertsService,
    private _toast: ToastService,
    private _inventoryIncome: InventoryIncomeService,
    private _localInventoryIncome: LocalInventoryIncomeService,
    private _localInventoryIncomeDetails: LocalInventoryIncomeDetailService,
    private _unitBase: UnitBaseService,
    private _localUnitBase: LocalUnitBaseService,
    private _localInventory: LocalInventoryService
  ) {
    addIcons({ search, list, bookmark, save });

    this.form = new FormGroup({
      amount: new FormControl<number>(0, [Validators.required]),
      equivalency: new FormControl<number>(0, [Validators.min(0.01)]),
      baseAmount: new FormControl<number>({ value: 0, disabled: true }, [
        Validators.min(1),
      ]),
      cost: new FormControl<number>(0, [
        Validators.required,
        Validators.min(1),
      ]),
    });

    this.fabOptions = [
      {
        title: 'Limpiar',
        do: () => {
          this.clear(/*confirm*/ true);
        },
      },
    ];
  }

  ngOnInit() {
    this.form.valueChanges.pipe(debounceTime(300)).subscribe((values) => {
      const amount = values?.amount || 0;
      const equivalency = values?.equivalency || 0;
      this.form.get('baseAmount')?.setValue(amount * equivalency);
    });
  }

  protected async searchProduct() {
    const result = await this._modal.showProductListModal();
    if (!result) return;
    this.product = result.product;

    if(this.product.idBaseUnit){
      this.baseUnit = await this._unit.get(this.product.idBaseUnit);
    }

    this.checkUnits();
  }

  protected async searchUnit() {
    const result = await this._modal.showUnitsList();
    if (!result) return;
    this.unit = result;

    const control = this.form.get('amount');
    if (!this.unit.allowDecimals) {
      control?.addValidators(Validators.min(1));
      control?.addValidators(Validators.pattern(/^-?\d+(?:\.0+)?$/));
    } else {
      control?.addValidators(Validators.min(0.01));
      control?.addValidators(Validators.pattern(/^-?\d+(\.\d{1,4})?$/));
    }
    this.checkUnits();
  }

  private async checkUnits() {
    if (
      this.product &&
      this.unit &&
      this.baseUnit &&
      this.unit.id != this.baseUnit!.id
    ) {
      this.showEquivalency = true;
      this.form.get('equivalency')?.addValidators(Validators.required);
      this.form.get('baseAmount')?.addValidators(Validators.required);

      const control = this.form.get('equivalency');
      if (!this.baseUnit.allowDecimals) {
        control?.addValidators(Validators.min(1));
        control?.addValidators(Validators.pattern(/^-?\d+(?:\.0+)?$/));
      } else {
        control?.addValidators(Validators.min(0.01));
        control?.addValidators(Validators.pattern(/^-?\d+(\.\d{1,4})?$/));
      }

      const unitBaseRelation = await this._localUnitBase.get({
        idUnit: this.unit.id as number,
        idUnitBase: this.baseUnit.id as number
      });
      control?.setValue(unitBaseRelation?.equivalency);
    } else {
      this.showEquivalency = false;
      this.form.get('equivalency')?.removeValidators(Validators.required);
      this.form.get('baseAmount')?.removeValidators(Validators.required);
    }
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
    if (this.form.get('cost')?.invalid) {
      this._alert.showError('Costo inválido');
      return false;
    }

    if (this.showEquivalency) {
      if (this.form.get('equivalency')?.invalid) {
        this._alert.showError('Equivalencia inválida');
        return false;
      }
      if (this.form.get('baseAmount')?.invalid) {
        this._alert.showError('Cantidad de unidad base inválida');
        return false;
      }
    }

    return true;
  }

  protected onAdd() {
    if (!this.checkBeforeAdding()) return;
    const newDetail: IInventoryIncomeDetail = {
      id: {
        idInventoryIncome: 0,
        idProduct: this.product!.id as number,
        idUnit: this.unit!.id as number,
      },
      amount: this.form.get('amount')!.value as number,
      amountBaseUnit: (this.form.get('baseAmount')?.value ||
        this.form.get('amount')!.value) as number,
      cost: this.form.get('cost')!.value as number,
      state: true,
      uploaded: States.NOT_INSERTED,
      idBaseUnit: this.baseUnit?.id as number,
      equivalencyUsed: this.form.get('equivalency')?.value
    };

    const index = this.details.findIndex((detail) => {
      return (
        detail.id.idInventoryIncome == newDetail.id.idInventoryIncome &&
        detail.id.idProduct == newDetail.id.idProduct &&
        detail.id.idUnit == newDetail.id.idUnit
      );
    });

    if (index != -1) {
      this.details[index] = newDetail;
      this.clear();
      return;
    }

    this.details.push(newDetail);
    this._toast.showToast(
      'Compra agregada'.toUpperCase(),
      2000,
      'primary',
      'top'
    );
    this.clear();
  }

  private async clear(showConfirm: boolean = false) {
    if (showConfirm) {
      const result = await this._alert.showConfirm(
        'CONFIRME',
        '¿Está seguro de limpiar el formulario?'
      );
      if (!result) return;
    }

    this.form.reset();
    this.product = undefined;
    this.unit = undefined;
    this.baseUnit = undefined;
    this.showEquivalency = false;
  }

  protected onList() {
    if (this.details.length == 0) {
      this._toast.showToast(
        'No tiene elementos agregados',
        3000,
        'danger',
        'top'
      );
      return;
    }
    this._modal.showInventoryIncomeDetailsList(this.details);
  }

  private checkBeforeFinishing(): boolean {
    if (this.details.length == 0) {
      this._alert.showError('No tiene elementos agregados');
      return false;
    }

    return true;
  }

  protected async onFinish() {
    if (!this.checkBeforeFinishing()) return;
    if (
      !(await this._alert.showConfirm(
        'CONFIRME',
        '¿Está seguro de finalizar la compra de mercancías?'
      ))
    )
      return;

    const id = await this._localInventoryIncome.getNextID();
    let totalCost = 0;
    this.details.forEach((detail, index) => {
      this.details[index].id.idInventoryIncome = id;
      totalCost += detail.cost;
    });

    const inventoryIncome: IInventoryIncome = {
      id: id,
      date: new Date(),
      details: this.details,
      state: true,
      totalCost: totalCost,
      uploaded: States.NOT_INSERTED,
    };

    const result = await this._inventoryIncome.insert(inventoryIncome) ? States.SYNC : States.NOT_INSERTED;
    inventoryIncome.uploaded = result;
    this.details.map(detail => detail.uploaded = result);

    inventoryIncome.details = [];
    await firstValueFrom(
      forkJoin([
        this._localInventoryIncome.insert(inventoryIncome),
        this._localInventoryIncomeDetails.insertDetails(this.details),
        this.syncUnitBase(this.details),
        this.syncLocalInventory(this.details)
      ])
    )
      .then(() => {
        this._alert.showSuccess('Compra de mercancías éxitosa');
        this.clear();
        this.details = [];
      })
      .catch(() => {
        this._alert.showError('Error guardando compra de mercancías');
      });
  }

  private async syncUnitBase(details: Array<IInventoryIncomeDetail>) {

    const sync = async (detail: IInventoryIncomeDetail) => {
      if (
        !detail.idBaseUnit || +detail.id.idUnit == +detail.idBaseUnit
      ) return;

      const old = await this._localUnitBase.get({
        idUnit: detail.id.idUnit as number,
        idUnitBase: detail.idBaseUnit as number
      });

      const unitBase: IUnitBase = {
        id: {
          idUnit: detail.id.idUnit as number,
          idUnitBase: detail.idBaseUnit as number
        },
        equivalency: detail!.equivalencyUsed as number,
        state: true,
        uploaded: States.NOT_INSERTED
      };

      if (!old) {
        await save(unitBase, 'insert');
      } else {
        await save(unitBase, 'update');
      }
    }
    const save = async (unitBase: IUnitBase, action: 'insert' | 'update') => {
      try {

        let result: States = States.NOT_INSERTED;
        switch (action) {
          case 'insert':
            result = (await this._unitBase.insert(unitBase)) ? States.SYNC : States.NOT_INSERTED;
            unitBase.uploaded = result;

            await this._localUnitBase.insert(unitBase);
            break;
          case 'update':
            result = (await this._unitBase.update(unitBase)) ? States.NOT_UPDATED : States.NOT_INSERTED;
            unitBase.uploaded = result;
            await this._localUnitBase.update(unitBase);
            break;
        }
      } catch (error) {
        throw error;
      }
    }

    const pros = details.map(detail => {
      return sync(detail);
    });

    await firstValueFrom(forkJoin(pros));
  }

  private async syncLocalInventory(details: Array<IInventoryIncomeDetail>) {
    const pros = details.map(async detail => {
      this._localInventory.increaseExistence(detail.id.idProduct, detail.amountBaseUnit!);
    });
    await firstValueFrom(forkJoin(pros));
  }
}
