import { Component, Input, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonInput,
  IonButton,
  ModalController,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { FormsModule, NgModel } from '@angular/forms';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { LocalCashBoxService } from 'src/app/services/local/local-cash-box/local-cash-box.service';
import { CashBoxService } from 'src/app/services/api/cash-box/cash-box.service';
import { ICashBox } from 'src/app/models/cash-box.model';
import { States } from 'src/app/services/constants';
import { FilesService } from 'src/app/services/files/files.service';
import { PrintingService } from 'src/app/services/printing/printing.service';
import { ErrorsService } from 'src/app/services/api/errors/errors.service';

@Component({
  selector: 'app-cash-box',
  templateUrl: './cash-box.component.html',
  styleUrls: ['./cash-box.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonInput,
    IonHeader,
    IonContent,
    HeaderBarComponent,
    FormsModule,
  ],
})
export class CashBoxComponent implements OnInit {
  protected title: string = 'Caja';
  protected inputPlaceholder: string = '';
  protected label: string = '';
  protected amount: number = 0;
  protected buttonText: string = '';
  @Input({ required: true }) type!: 'open' | 'close';
  @Input() balance: number = 0;

  private cashbox?: ICashBox;

  constructor(
    private _modalCtrl: ModalController,
    private _alert: AlertsService,
    private _localCashbox: LocalCashBoxService,
    private _cashbox: CashBoxService,
    private _file: FilesService,
    private _printing: PrintingService,
    private _error: ErrorsService
  ) { }

  async ngOnInit() {
    switch (this.type) {
      case 'open':
        this.title = 'Abrir Caja';
        this.inputPlaceholder = 'Ingrese la cantidad de apertura';
        this.label = 'Cantidad de Apertura';
        this.buttonText = 'Abrir Caja';
        break;
      case 'close':
        this.cashbox = (await this._localCashbox.getAll()).find(c => c.state);

        if (!this.cashbox) {
          this._alert.showError('No hay ninguna caja abierta');
          this._modalCtrl.dismiss();
          return;
        }

        this.title = 'Cerrar Caja';
        this.inputPlaceholder = 'Ingrese la cantidad de cierre';
        this.label = 'Cantidad de Cierre';
        this.buttonText = 'Cerrar Caja';
        this.amount = this.balance;
        break;
    }
  }

  private checkForm(): boolean {
    if (this.amount < 1) {
      this._alert.showError('La cantidad debe ser mayor a 0');
      return false;
    }
    return true;
  }

  protected async onClose() {
    if (!this.checkForm()) return;

    if (
      !(await this._alert.showConfirm(
        'CONFIRME',
        this.type == 'open'
          ? '¿Está seguro de abrir la caja?'
          : '¿Está seguro de cerrar la caja?'
      ))
    )
      return;

    let cashbox: ICashBox = {
      id: await this._localCashbox.getNextID(),
      init: new Date(),
      initCash: this.amount,
      state: true,
      uploaded: States.NOT_INSERTED,
    };

    const open = async () => {
      const result = await this._cashbox.insert(cashbox);

      cashbox.uploaded = result ? States.SYNC : States.NOT_INSERTED;
      await this._localCashbox
        .insert(cashbox)
        .then(() => {
          this._alert.showSuccess(`Caja abierta con $${this.amount.toFixed(2)}`);
          this._modalCtrl.dismiss(this.amount);
        })
        .catch((err) => {
          this._file.saveError(err);
          this._alert.showError('Error abriendo caja');
        });
    };

    const close = async () => {
      cashbox = this.cashbox!;

      cashbox.end = new Date();
      cashbox.endCash = this.amount;
      cashbox.state = false;

      const result = await this._cashbox.update(cashbox);

      cashbox.uploaded = result ? States.SYNC : States.NOT_UPDATED;

      await this._localCashbox
        .update(cashbox)
        .then(async () => {
          try {
            await this._printing.printSells(cashbox);
            this._alert.showSuccess(`Caja cerrada con $${this.amount.toFixed(2)}`);
            this._modalCtrl.dismiss(this.amount);
          } catch (error) {
            this._alert.showError(`Error en finalizacion de caja: ${error}`);
            this._file.saveError(error);
            this._error.saveErrors(new Error(JSON.stringify(error)));
            console.log(error);
          }
        })
        .catch((err) => {
          this._file.saveError(err);
          this._error.saveErrors(err);
          this._alert.showError('Error cerrando caja');
        });
    };

    switch (this.type) {
      case 'open':
        await open();
        break;
      case 'close':
        await close();
        break;
    }
  }
}
