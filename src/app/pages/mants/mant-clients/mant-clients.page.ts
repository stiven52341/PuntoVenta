import { TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, ValidationErrors } from '@angular/forms';
import { IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonLabel, IonTextarea } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sadOutline, save, search, trash } from 'ionicons/icons';
import { of } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { IClient } from 'src/app/models/client.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { ClientService } from 'src/app/services/api/client/client.service';
import { ErrorsService } from 'src/app/services/api/errors/errors.service';
import { States } from 'src/app/services/constants';
import { FilesService } from 'src/app/services/files/files.service';
import { LocalClientService } from 'src/app/services/local/local-client/local-client.service';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { MaskitoOptions, MaskitoElementPredicate, maskitoTransform } from '@maskito/core';
import { MaskitoDirective } from '@maskito/angular';
import { CurrentEmployeeService } from 'src/app/services/local/current-employee/current-employee.service';

@Component({
  selector: 'app-mant-clients',
  templateUrl: './mant-clients.page.html',
  styleUrls: ['./mant-clients.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, HeaderBarComponent, IonInput, IonButton, IonIcon, IonFooter,
    IonLabel, ReactiveFormsModule, MaskitoDirective, IonTextarea
  ],
  providers: [TitleCasePipe]
})
export class MantClientsPage implements OnInit {
  protected client?: IClient;
  protected form: FormGroup;
  protected loading: boolean = false;
  protected barOptions: Array<IButton>;
  protected readonly phoneMask: MaskitoOptions;
  protected readonly maskPredicate: MaskitoElementPredicate;

  constructor(
    private _modal: ModalsService, private _alert: AlertsService, private _localClient: LocalClientService,
    private _client: ClientService, private _error: ErrorsService, private _file: FilesService,
    private _titleCase: TitleCasePipe, private _currentUser: CurrentEmployeeService
  ) {
    addIcons({ search, save, trash });

    this.phoneMask = {
      mask: ['(', /\d/, /\d/, /\d/, ')', /\d/, /\d/, /\d/, '-', /\d/, /\d/, /\d/, /\d/]
    };

    this.maskPredicate = async (el) => {
      const ion = el as unknown as HTMLIonInputElement;
      const input = await ion.getInputElement(); // Promise<HTMLInputElement | HTMLTextAreaElement>
      return input;
    };

    this.form = new FormGroup({
      name: new FormControl<string>('', [
        Validators.required, Validators.maxLength(50), Validators.pattern(/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]+$/)
      ]),
      phone: new FormControl<string>('', [
        Validators.required, Validators.maxLength(50),
        Validators.pattern(/^(?:\(\d{3}\)\d{3}-\d{4}|\d{3}-\d{3}-\d{4}|\d{10})$/)
      ]),
      address: new FormControl<string | null>(null, [Validators.maxLength(200)]),
      maxCredit: new FormControl<number>(0, [Validators.required, Validators.min(0)])
    });

    this.barOptions = [
      {
        title: 'Limpiar',
        do: async () => {
          if (!await this._alert.showConfirm(undefined, '¿Está seguro de limpiar el formulario?')) return;
          this.clear();
          this._alert.showWarning('Formulario limpiado');
        }
      }
    ];
  }

  ngOnInit() {
  }

  protected async onSearchClients() {
    const client = await this._modal.showClientsList();
    if (!client) return;
    this.client = client;
    this.setClientValues(this.client);
  }

  private setClientValues(client: IClient) {
    this.form.get('name')?.setValue(client.name);
    this.form.get('phone')?.setValue(client.phone);
    this.form.get('address')?.setValue(client.address);
    this.form.get('maxCredit')?.setValue(client.maxCredit);
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

    if (this.form.get('maxCredit')?.invalid) {
      this._alert.showError('Crédito máximo inválido');
      return false;
    }

    return true;
  }

  protected async onSubmit() {
    if (!this.check()) return;

    this.loading = true;
    try {
      if (!this.client) {
        await this.onSave();
      } else {
        await this.onModify();
      }
    } finally {
      this.loading = false;
    }
  }

  private async onSave() {
    if (!await this._alert.showConfirm(undefined, '¿Está seguro de guardar el nuevo cliente?')) return;

    const user = await this._currentUser.getCurrentEmployee();
    const newClient: IClient = {
      id: await this._localClient.getNextID(),
      name: this._titleCase.transform(this.form.get('name')!.value as string),
      phone: this.form.get('phone')!.value as string,
      address: this.form.get('address')?.value as string,
      maxCredit: this.form.get('maxCredit')!.value as number,
      state: true,
      uploaded: States.NOT_INSERTED,
      balance: 0,
      idEmployee: user!.id
    };

    newClient.uploaded = await this._client.insert(newClient) ? States.SYNC : States.NOT_INSERTED;
    this._localClient.insert(newClient).then(() => {
      this._alert.showSuccess('Cliente creado');
      this.clear();
    }).catch(err => {
      this._alert.showError('Error creado cliente');
      this._error.saveErrors(err);
      this._file.saveError(err);
    });
  }

  private async onModify() {
    if (!await this._alert.showConfirm(undefined, '¿Está seguro de modificar el cliente?')) return;

    const user = await this._currentUser.getCurrentEmployee();
    const newClient: IClient = {
      id: this.client!.id,
      name: this._titleCase.transform(this.form.get('name')!.value as string),
      phone: this.form.get('phone')!.value as string,
      address: this.form.get('address')?.value as string,
      maxCredit: this.form.get('maxCredit')!.value as number,
      state: true,
      uploaded: States.NOT_UPDATED,
      balance: this.client!.balance,
      idEmployee: user!.id
    };
    newClient.uploaded = await this._client.update(newClient) ? States.SYNC : States.NOT_UPDATED;
    this._localClient.update(newClient).then(() => {
      this._alert.showSuccess('Cliente modificado');
      this.clear();
    }).catch(err => {
      this._alert.showError('Error modificando cliente');
      this._error.saveErrors(err);
      this._file.saveError(err);
    });
  }

  protected async onChangeStatus(action: 'activate' | 'disable' = 'disable') {
    switch (action) {
      case 'activate':
        if (!await this._alert.showConfirm(undefined, '¿Está seguro de reactivar el cliente?')) return;

        this.loading = true;
        this.client!.state = true;
        const result = await this._client.update(this.client!) ? States.SYNC : States.NOT_UPDATED;
        this.client!.uploaded = result;
        this._localClient.update(this.client!).then(() => {
          this._alert.showSuccess('Cliente reactivado');
        }).catch(err => {
          this._alert.showError('Error reactivando cliente');
          this._error.saveErrors(err);
          this._file.saveError(err);
        }).finally(() => this.loading = false);
        break;
      case 'disable':
        if (!await this._alert.showConfirm(undefined, '¿Está seguro de desactivar el cliente?')) return;
        this.loading = true;
        this.client!.state = false;
        const result2 = await this._client.delete(this.client!) ? States.SYNC : States.NOT_DELETED;
        this.client!.uploaded = result2;
        this._localClient.deactivate(this.client!).then(() => {
          this._alert.showSuccess('Cliente desactivado');
        }).catch(err => {
          this._alert.showError('Error desactivando cliente');
          this._error.saveErrors(err);
          this._file.saveError(err);
        }).finally(() => this.loading = false);
        break;
    }
  }

  private clear() {
    this.form.reset();
    this.client = undefined;
  }
}
