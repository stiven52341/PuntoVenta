import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonInputPasswordToggle, IonLabel, IonSelect, IonSelectOption, IonTextarea } from '@ionic/angular/standalone';
import { MaskitoDirective } from '@maskito/angular';
import { MaskitoElementPredicate, MaskitoOptions } from '@maskito/core';
import { addIcons } from 'ionicons';
import { save, search } from 'ionicons/icons';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { IEmployee } from 'src/app/models/employee.model';
import { IUserType } from 'src/app/models/user-type.modal';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { EmployeeService } from 'src/app/services/api/employee/employee.service';
import { ErrorsService } from 'src/app/services/api/errors/errors.service';
import { States } from 'src/app/services/constants';
import { FilesService } from 'src/app/services/files/files.service';
import { LocalEmployeeService } from 'src/app/services/local/local-employee/local-employee.service';
import { LocalUserTypeService } from 'src/app/services/local/local-user-type/local-user-type.service';
import { ModalsService } from 'src/app/services/modals/modals.service';

@Component({
  selector: 'app-mant-employees',
  templateUrl: './mant-employees.page.html',
  styleUrls: ['./mant-employees.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, HeaderBarComponent, IonInput, IonButton, IonIcon, ReactiveFormsModule,
    MaskitoDirective, IonTextarea, IonSelect, IonSelectOption, IonInputPasswordToggle,
    IonFooter, IonButton, IonLabel
  ],
  providers: [TitleCasePipe]
})
export class MantEmployeesPage implements OnInit {
  protected loading: boolean = false;
  protected employee?: IEmployee;
  protected types: Array<IUserType> = [];
  protected form: FormGroup;
  protected readonly phoneMask: MaskitoOptions;
  protected readonly maskPredicate: MaskitoElementPredicate;
  protected headerOps: Array<IButton>;

  constructor(
    private readonly _modal: ModalsService,
    private readonly _userTypes: LocalUserTypeService,
    private readonly _alert: AlertsService,
    private readonly _localEmployee: LocalEmployeeService,
    private readonly _employee: EmployeeService,
    private readonly _error: ErrorsService,
    private readonly _file: FilesService,
    private readonly _title: TitleCasePipe
  ) {
    addIcons({ search, save });

    this.phoneMask = {
      mask: ['(', /\d/, /\d/, /\d/, ')', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
    };

    this.maskPredicate = async (el) => {
      const ion = el as unknown as HTMLIonInputElement;
      const input = await ion.getInputElement(); // Promise<HTMLInputElement | HTMLTextAreaElement>
      return input;
    };

    this.form = new FormGroup({
      name: new FormControl<string>('', [Validators.required, Validators.maxLength(50)]),
      phone: new FormControl<string>('', [
        Validators.required, Validators.maxLength(50), Validators.pattern(/^(?:\+\d{1,2}\s*)?\(\d{3}\)\s?\d{3}-\d{4}$/)
      ]),
      address: new FormControl<string>('', [Validators.maxLength(200)]),
      type: new FormControl<number | null>(null, [Validators.required]),
      username: new FormControl<string>('', [Validators.required, Validators.maxLength(50)]),
      password: new FormControl<string>('', [Validators.required, Validators.maxLength(50)]),
      state: new FormControl<boolean>(true, [Validators.required])
    });

    this.headerOps = [
      {
        title: 'Limpiar',
        do: async () => {
          await this.clear();
        }
      }
    ];
  }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init() {
    this.types = await this._userTypes.getAll();
    this.form.get('type')?.setValue(this.types[0].id);
  }

  protected async onSelectEmployee() {
    const employee = await this._modal.showEmployeesList();
    if (!employee) return;
    this.employee = employee;
    this.setForm(this.employee);
  }

  private async setForm(employee: IEmployee) {
    this.form.get('name')?.setValue(employee.name);
    this.form.get('phone')?.setValue(employee.phone);
    this.form.get('address')?.setValue(employee.address || '');
    this.form.get('type')?.setValue(employee.idUserType);
    this.form.get('username')?.setValue(employee.username);
    this.form.get('password')?.setValue(employee.password);
    this.form.get('state')?.setValue(employee.state);
  }

  private check(): boolean {
    if (this.form.get('name')?.invalid) {
      this._alert.showError('Nombre inválido');
      return false;
    }

    if (this.form.get('phone')?.invalid) {
      this._alert.showError('Teléfono inválido');
      return false;
    }

    if (this.form.get('address')?.invalid) {
      this._alert.showError('Dirección inválida');
      return false;
    }

    if (this.form.get('type')?.invalid) {
      this._alert.showError('Tipo de usuario inválido');
      return false;
    }

    if (this.form.get('username')?.invalid) {
      this._alert.showError('Nombre de usuario inválido');
      return false;
    }

    if (this.form.get('password')?.invalid) {
      this._alert.showError('Contraseña inválida');
      return false;
    }

    if (this.form.get('state')?.invalid) {
      this._alert.showError('Estado inválido');
      return false;
    }

    return true;
  }

  protected async onSave() {
    if (!this.check()) return;

    if (!await this._alert.showConfirm(undefined, '¿Está seguro de guardar?')) return;

    const employee: IEmployee = {
      id: this.employee?.id || await this._localEmployee.getNextID(),
      idUserType: this.form.get('type')!.value as number,
      name: this._title.transform(this.form.get('name')!.value as string).trim(),
      password: this.form.get('password')!.value as string,
      phone: this.form.get('phone')!.value as string,
      state: this.form.get('state')!.value as boolean,
      uploaded: States.NOT_INSERTED,
      username: this.form.get('username')!.value as string,
      address: (this.form.get('address')?.value || '') as string
    };

    if (this.employee == undefined) {
      await this.saveNew(employee);
    } else {
      await this.modify(employee);
    }
  }

  private async saveNew(employee: IEmployee) {
    this.loading = true;
    const result = await this._employee.insert(employee) ? States.SYNC : States.NOT_INSERTED;

    employee.uploaded = result;
    this._localEmployee.insert(employee)
      .then(() => {
        this._alert.showSuccess('Empleado creado con éxito');
        this.clear(false);
      })
      .catch(err => {
        this._alert.showError('Error al crear empleado');
        this._error.saveErrors(err);
        this._file.saveError(err);
      }).finally(() => this.loading = false);
  }

  private async modify(employee: IEmployee) {
    this.loading = true;
    const result = await this._employee.update(employee) ? States.SYNC : States.NOT_UPDATED;

    employee.uploaded = result;
    this._localEmployee.update(employee)
      .then(() => {
        this._alert.showSuccess('Empleado modificado con éxito');
        this.clear(false);
      })
      .catch(err => {
        this._alert.showError('Error al modificar empleado');
        this._error.saveErrors(err);
        this._file.saveError(err);
      }).finally(() => this.loading = false);
  }

  private async clear(showWarning: boolean = true) {
    if (showWarning) {
      const result = await this._alert.showConfirm(undefined, '¿Está seguro de limpiar el formulario?');
      if (!result) return;
    }

    this.employee = undefined;
    this.form.reset();
    this.form.get('type')?.setValue(this.types[0].id);
    this.form.get('state')?.setValue(true);
  }
}
