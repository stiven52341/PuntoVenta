import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonContent, IonIcon, IonImg, IonInput, IonLabel, ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, addCircle, save } from 'ionicons/icons';
import { IBillInvoice } from 'src/app/models/bill-invoice.model';
import { IBill } from 'src/app/models/bill.model';
import { ICoin } from 'src/app/models/coin.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { BillInvoiceService } from 'src/app/services/api/bill-invoice/bill-invoice.service';
import { ErrorsService } from 'src/app/services/api/errors/errors.service';
import { States } from 'src/app/services/constants';
import { FilesService } from 'src/app/services/files/files.service';
import { LocalBillsService } from 'src/app/services/local/bills/bills.service';
import { LocalBillInvoiceService } from 'src/app/services/local/local-bill-invoice/local-bill-invoice.service';

@Component({
  selector: 'app-bill-pay',
  templateUrl: './bill-pay.component.html',
  styleUrls: ['./bill-pay.component.scss'],
  standalone: true,
  imports: [IonContent, IonInput, FormsModule, IonButton, IonIcon, IonLabel, IonImg]
})
export class BillPayComponent implements OnInit {
  @Input({ required: true }) idBill!: number;
  @Input() bill?: IBill;
  @ViewChild('payInput', { static: false }) payInput?: IonInput;
  protected loading: boolean = false;
  protected pay: number = 0;
  constructor(
    private _localBill: LocalBillsService, private _alert: AlertsService,
    private _billInvoice: BillInvoiceService, private _localBillInvoice: LocalBillInvoiceService,
    private _file: FilesService, private _error: ErrorsService,
    private _modalCtrl: ModalController
  ) {
    addIcons({ save, addCircle });
  }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init() {
    setTimeout(() => {
      this.payInput?.setFocus();
    }, 300);

    if (!this.bill) {
      this.bill = await this._localBill.get(this.idBill);
    }
  }

  protected getToPay() {
    return (this.bill?.total || 0) - (this.bill?.balance || 0);
  }

  private check(): boolean {
    if (this.pay <= 0) {
      this._alert.showError('La cantidad a abonar debe ser mayor a cero.');
      return false;
    }

    if (this.pay > this.getToPay()) {
      this._alert.showError('La cantidad a abonar no puede ser mayor a lo que falta por pagar.');
      return false;
    }

    if(!this.bill){
      this._alert.showError('No se encontró la factura');
      return false;
    }

    return true;
  }

  protected onApply() {
    this.pay = this.getToPay();
  }

  protected async onProcess() {
    if(!this.check()) return;

    if(!await this._alert.showConfirm(undefined, '¿Está seguro de registrar este abono a factura?')){
      return;
    }

    this.loading = true;

    const billInvoice: IBillInvoice = {
      id: await this._localBillInvoice.getNextID(),
      amount: Number(this.pay.toFixed(2)),
      idBill: this.bill!.id,
      state: true,
      uploaded: States.NOT_INSERTED
    };

    const result = await this._billInvoice.insert(billInvoice) ? States.SYNC : States.NOT_INSERTED;
    billInvoice.uploaded = result;

    this._localBillInvoice.insert(billInvoice).then(async () => {
      await this._localBill.addBillInvoice(billInvoice).then(() => {
        this._alert.showSuccess('Abono a factura registrado con éxito');
        this._modalCtrl.dismiss(billInvoice);
      }).catch(err => {
        throw err;
      }).finally(() => this.loading = false);
    }).catch(err => {
      this._alert.showError('Error registrando abono a factura');
      this._file.saveError(err);
      this._error.saveErrors(err);
    }).finally(() => this.loading = false);
  }
}
