import { TitleCasePipe } from '@angular/common';
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
  IonInput,
  IonButton,
  IonIcon,
  IonLabel,
  IonCheckbox,
  IonFooter,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { States } from 'src/app/services/constants';
import { IUnit } from 'src/app/models/unit.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { UnitService } from 'src/app/services/api/unit/unit.service';
import { FilesService } from 'src/app/services/files/files.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { CurrentEmployeeService } from 'src/app/services/local/current-employee/current-employee.service';

@Component({
  selector: 'app-mant-units',
  templateUrl: './mant-units.page.html',
  styleUrls: ['./mant-units.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonIcon,
    IonButton,
    IonInput,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    ReactiveFormsModule,
    IonCheckbox,
    IonFooter,
  ],
  providers: [TitleCasePipe],
})
export class MantUnitsPage implements OnInit {
  protected unit?: IUnit;
  protected form: FormGroup;
  protected headerButtons: Array<IButton>;
  protected loading: boolean = false;

  constructor(
    private _modal: ModalsService,
    private _alert: AlertsService,
    private _localUnit: LocalUnitsService,
    private _unit: UnitService,
    private _file: FilesService,
    private _title: TitleCasePipe,
    private _global: GlobalService,
    private _currentUser: CurrentEmployeeService
  ) {
    addIcons({ search });

    this.form = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50),
      ]),
      short: new FormControl(null, [Validators.maxLength(10)]),
      allowDecimals: new FormControl(false, [])
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
  getName(): 'billing' | 'cashbox' | 'inventory' | 'mants' {
    return 'mants';
  }

  ngOnInit() {}

  protected async onSearchUnit() {
    this.unit = await this._modal.showUnitsList();
    if (this.unit) this.setForm(this.unit);
  }

  private setForm(unit: IUnit) {
    this.form.get('name')?.setValue(unit.name);
    this.form.get('short')?.setValue(unit.shortcut);
    this.form.get('allowDecimals')?.setValue(unit.allowDecimals);
  }

  private checkForm(): boolean {
    if (this.form.get('name')?.invalid) {
      this._alert.showError('Nombre inválido');
      return false;
    }

    if (this.form.get('short')?.invalid) {
      this._alert.showError('Abreviatura inválida');
      return false;
    }

    if (this.form.get('equivalency')?.invalid) {
      this._alert.showError('Equivalencia inválida');
      return false;
    }

    return true;
  }

  protected async onSave() {
    if (!this.checkForm()) return;

    const text = this.unit
      ? '¿Está seguro de modificar la unidad?'
      : '¿Está seguro de guardar la unidad?';
    if (!(await this._alert.showConfirm('CONFIRME', text))) return;

    this.loading = true;
    const user = await this._currentUser.getCurrentEmployee();
    const unit: IUnit = {
      id: await this._localUnit.getNextID(),
      name: this._title.transform(this.form.get('name')!.value as string),
      shortcut: this.form.get('short')?.value
        ? (this.form.get('short')?.value as string).toUpperCase()
        : undefined,
      state: true,
      uploaded: States.NOT_INSERTED,
      allowDecimals: this.form.get('allowDecimals')?.value || false,
      idEmployee: user!.id
    };

    if (!this.unit) {
      const newUnit = await this._unit.insert(unit);
      const updated = newUnit ? States.SYNC : States.NOT_INSERTED;

      unit.uploaded = updated;
      await this._localUnit
        .insert(unit)
        .then(() => {
          this._alert.showSuccess('UNIDAD GUARDADA');
          this._global.updateData();
          this.clearForm(false);
        })
        .catch((err) => {
          this._alert.showError('Error guardando unidad');
          this._file.saveError(err);
        });
    } else {
      unit.id = this.unit.id;
      const updated = (await this._unit.update(unit))
        ? States.SYNC
        : States.NOT_UPDATED;
      unit.uploaded = updated;
      await this._localUnit
        .update(unit)
        .then(() => {
          this._alert.showSuccess('UNIDAD MODIFICADA');
          this._global.updateData();
          this.clearForm(false);
        })
        .catch((err) => {
          this._alert.showError('Error modificando unidad');
          this._file.saveError(err);
        });
    }
    this.loading = false;
  }

  private async clearForm(showWarning: boolean = true) {
    if (showWarning) {
      if (
        !(await this._alert.showConfirm(
          'CONFIRME',
          '¿Está seguro de limpiar el formulario?'
        ))
      )
        return;
    }

    this.form.reset();
    this.unit = undefined;
  }

  protected async setUnitState(action: 'enable' | 'disable' = 'disable') {
    if (!this.unit) return;

    if (
      !(await this._alert.showConfirm(
        'CONFIRME',
        '¿Está seguro de desactivar esta unidad?'
      ))
    )
      return;

    const disable = async (unit: IUnit) => {
      const result = (await this._unit.delete(unit))
        ? States.SYNC
        : States.NOT_DELETED;

      unit.uploaded = result;
      await this._localUnit
        .deactivate(unit)
        .then(() => {
          this._alert.showSuccess('Unidad desactivada');
          this._global.updateData();
        })
        .catch((err) => {
          this._alert.showError('Error al desactivar unidad');
          this._file.saveError(err);
        });
    };

    const activate = async (unit: IUnit) => {
      unit.state = true;
      const result = (await this._unit.update(unit))
        ? States.SYNC
        : States.NOT_UPDATED;

      unit.uploaded = result;
      await this._localUnit
        .update(unit)
        .then(() => {
          this._alert.showSuccess('Unidad activada');
          this._global.updateData();
        })
        .catch((err) => {
          this._alert.showError('Error al activar unidad');
          this._file.saveError(err);
        });
    };

    switch(action){
      case 'enable':
        await activate(this.unit);
        break;
      case 'disable':
        await disable(this.unit);
        break;
    }
  }
}
