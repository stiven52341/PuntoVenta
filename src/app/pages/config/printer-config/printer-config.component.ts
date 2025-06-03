import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save, search } from 'ionicons/icons';
import {
  IPrinterModel,
  Printer,
  SUPPORTED_PRINTER_MODELS,
} from 'src/app/models/printer.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { BluetoothService } from 'src/app/services/bluetooth/bluetooth.service';
import { PrinterService } from 'src/app/services/local/printer/printer.service';

@Component({
  selector: 'app-printer-config',
  templateUrl: './printer-config.component.html',
  styleUrls: ['./printer-config.component.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonInput,
    IonButton,
    IonIcon,
    ReactiveFormsModule,
    IonSelect,
    IonSelectOption,
  ],
})
export class PrinterConfigComponent implements OnInit {
  protected form: FormGroup;
  protected models: Array<IPrinterModel>;

  constructor(
    private _blue: BluetoothService,
    private _localPrinter: PrinterService,
    private _alert: AlertsService
  ) {
    addIcons({ search, save });

    this.models = SUPPORTED_PRINTER_MODELS;

    this.form = new FormGroup({
      id: new FormControl(null, [Validators.required]),
      model: new FormControl(null, [Validators.required])
    });
  }

  async ngOnInit() {
    const printer = await this._localPrinter.getCurrentPrinter();
    if(!printer) return;
    this.form.get('id')?.setValue(printer.id);
    this.form.get('model')?.setValue(printer.model.name);
  }

  protected async getPrinter() {
    const device = await this._blue.scan();
    if (!device) return;

    this.form.get('id')?.setValue(device.deviceId);
  }

  private check(): boolean {
    if (this.form.get('id')?.invalid) {
      this._alert.showError('Debe seleccionar una impresora');
      return false;
    }

    if (this.form.get('model')?.invalid) {
      this._alert.showError('Debe seleccionar un modelo de impresora');
      return false;
    }
    return true;
  }

  protected async onSave() {
    if(!this.check()) return;
    const model = this.models.find(model => model.name == this.form.get('model')!.value);
    const printer = new Printer(this.form.get('id')!.value, model!);
    
    await this._localPrinter.insert(printer).then(() => {
      this._alert.showSuccess('Impresora guardada');
    }).catch(err => {
      this._alert.showError('Error guardando impresora');
    });
  }
}
