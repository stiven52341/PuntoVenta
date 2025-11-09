import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonInput,
  IonButton,
  ModalController,
  IonImg,
  IonList,
  IonItem,
  IonLabel,
  IonFooter,
  IonIcon,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { LocalCashBoxService } from 'src/app/services/local/local-cash-box/local-cash-box.service';
import { CashBoxService } from 'src/app/services/api/cash-box/cash-box.service';
import { ICashBox } from 'src/app/models/cash-box.model';
import { States } from 'src/app/services/constants';
import { FilesService } from 'src/app/services/files/files.service';
import { PrintingService } from 'src/app/services/printing/printing.service';
import { ErrorsService } from 'src/app/services/api/errors/errors.service';
import { ICoin } from 'src/app/models/coin.model';
import { LocalCoinService } from 'src/app/services/local/local-coin/local-coin.service';
import { DecimalPipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { save } from 'ionicons/icons';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';
import { ICoinCashbox } from 'src/app/models/coin-cashbox.model';
import { LocalPrinterService } from 'src/app/services/local/local-printer/printer.service';
import { CurrentEmployeeService } from 'src/app/services/local/current-employee/current-employee.service';

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
    IonImg,
    IonList,
    IonItem,
    IonLabel,
    DecimalPipe,
    IonFooter,
    IonIcon,
    ReactiveFormsModule
  ],
})
export class CashBoxComponent implements OnInit, OnDestroy {
  protected title: string = 'Caja';
  protected inputPlaceholder: string = '';
  protected label: string = '';
  // protected amount: number = 0;
  protected buttonText: string = '';
  protected coins: Array<ICoin> = [];
  @Input({ required: true }) type!: 'open' | 'close';
  @Input() balance: number = 0;
  protected loading: boolean = false;
  protected total: number = 0;
  protected form: FormGroup;

  private cashbox?: ICashBox;
  private subs: Array<Subscription> = [];

  constructor(
    private _modalCtrl: ModalController,
    private _alert: AlertsService,
    private _localCashbox: LocalCashBoxService,
    private _cashbox: CashBoxService,
    private _file: FilesService,
    private _printing: PrintingService,
    private _error: ErrorsService,
    private _coin: LocalCoinService,
    private _number: DecimalPipe,
    private _printer: LocalPrinterService,
    private _user: CurrentEmployeeService
  ) {
    addIcons({ save });

    this.form = new FormGroup({});
  }

  async ngOnInit() {
    this.loading = true;
    this.coins = await this._coin.getAll();

    this.coins.forEach(coin => {
      this.form.addControl(coin.id.toString(), new FormControl<number>(0, [Validators.required, Validators.min(0)]));
    });

    const sub = this.form.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.total = 0;
      this.coins.forEach(coin => {
        const value = (this.form.get(coin.id.toString())?.value || 0) as number;
        this.total += value * coin.value;
      });
    });
    this.subs.push(sub);

    this.loading = false;

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
        this.total = 0;
        break;
    }
  }

  ngOnDestroy(): void {
    this.subs.map(sub => sub.unsubscribe());
  }

  private checkForm(): boolean {
    if (this.total < 1) {
      this._alert.showError('El total debe ser mayor a 0');
      return false;
    }

    for (const coin of this.coins) {
      if (this.form.get(coin.id.toString())?.invalid) {
        this._alert.showError(`Cantidad de $${this._number.transform(coin.value)} inválido`);
        return false;
      }
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

    const newID = await this._localCashbox.getNextID();

    const coinCash: Array<ICoinCashbox> = [];
    this.coins.forEach((coin, index) => {
      const amount = (this.form.get(coin.id.toString())?.value || 0) as number;
      coinCash.push({
        id: index,
        amount: amount,
        idCashbox: newID,
        idCoin: coin.id,
        state: true,
        uploaded: States.NOT_INSERTED,
        closing: this.type == 'close'
      });
    });

    const user = await this._user.getCurrentEmployee();
    let cashbox: ICashBox = {
      id: newID,
      init: new Date(),
      initCash: this.total,
      state: true,
      uploaded: States.NOT_INSERTED,
      coins: coinCash,
      idOpenEmployee: user!.id
    };

    const open = async () => {
      const result = await this._cashbox.insert(cashbox);

      cashbox.uploaded = result ? States.SYNC : States.NOT_INSERTED;
      await this._localCashbox
        .insert(cashbox)
        .then(async () => {
          this._alert.showSuccess(`Caja abierta con $${this.total.toFixed(2)}`);
          this._modalCtrl.dismiss(this.total);

          const printer = await this._printer.getCurrentPrinter();
          if (!printer) return;
          this._printing.printCashbox(cashbox, '¿Quiere imprimir la apertura de caja?');
        })
        .catch((err) => {
          this._file.saveError(err);
          this._alert.showError('Error abriendo caja');
        });
    };

    const close = async () => {
      this.loading = true;
      cashbox = this.cashbox!;
      cashbox.coins.push(...coinCash);

      cashbox.end = new Date();
      cashbox.endCash = this.total;
      cashbox.state = false;
      cashbox.idCloseEmployee = user!.id;

      const result = await this._cashbox.update(cashbox);

      cashbox.uploaded = result ? States.SYNC : States.NOT_UPDATED;

      await this._localCashbox
        .update(cashbox)
        .then(async () => {
          try {
            await this._printing.printSells(cashbox);
            await this._printing.printCashbox(cashbox, '¿Quire imprimir la caja?');
            this._alert.showSuccess(`Caja cerrada con $${this.total.toFixed(2)}`);
            this._modalCtrl.dismiss(this.total);
          } catch (error) {
            this._alert.showError(`Error en finalizacion de caja: ${error}`);
            this._file.saveError(error);
            this._error.saveErrors(new Error(JSON.stringify(error)));
            console.log(error);
          }finally{
            this.loading = false;
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
