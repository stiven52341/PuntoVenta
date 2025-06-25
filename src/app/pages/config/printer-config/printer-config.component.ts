import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonIcon,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonCheckbox,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { print, save, search } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { IGeneralInfo } from 'src/app/models/general-info.model';
import {
  IPrinterModel,
  Printer,
  SUPPORTED_PRINTER_MODELS,
} from 'src/app/models/printer.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { BluetoothService } from 'src/app/services/bluetooth/bluetooth.service';
import { GeneralInfoService } from 'src/app/services/local/general-info/general-info.service';
import { LocalPrinterService } from 'src/app/services/local/local-printer/printer.service';
import { PrintingService } from 'src/app/services/printing/printing.service';

@Component({
  selector: 'app-printer-config',
  templateUrl: './printer-config.component.html',
  styleUrls: ['./printer-config.component.scss'],
  standalone: true,
  imports: [
    IonCheckbox,
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
  private info?: IGeneralInfo;
  private printer?: Printer;

  constructor(
    private _blue: BluetoothService,
    private _localPrinter: LocalPrinterService,
    private _alert: AlertsService,
    private _generalInfo: GeneralInfoService,
    private _printing: PrintingService
  ) {
    addIcons({ search, save, print });

    this.models = SUPPORTED_PRINTER_MODELS;

    this.form = new FormGroup({
      id: new FormControl(null, [Validators.required]),
      model: new FormControl(null, [Validators.required]),
      printWithLogo: new FormControl(false, [Validators.required]),
    });
  }

  async ngOnInit() {
    const data = await firstValueFrom(
      forkJoin([
        this._localPrinter.getCurrentPrinter(),
        this._generalInfo.getGeneralInfo(),
      ])
    );
    this.printer = data[0];
    this.info = data[1];

    if (!this.printer) return;
    this.form.get('id')?.setValue(this.printer.id);
    this.form.get('model')?.setValue(this.printer.model.name);
    this.form
      .get('printWithLogo')
      ?.setValue(this.info?.imprimirConLogo || false);
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
    if (!this.check()) return;
    const model = this.models.find(
      (model) => model.name == this.form.get('model')!.value
    );
    const printer = new Printer(this.form.get('id')!.value, model!);
    this.info!.imprimirConLogo = this.form.get('printWithLogo')?.value || false;

    this._generalInfo.update(this.info!);

    if (this.printer) {
      await this._localPrinter
        .update(printer)
        .then(() => {
          this._alert.showSuccess('Impresora guardada');
        })
        .catch((err) => {
          this._alert.showError('Error actualizando impresora');
        });
    } else {
      await this._localPrinter
        .insert(printer)
        .then(() => {
          this._alert.showSuccess('Impresora guardada');
          this.printer = printer;
        })
        .catch((err) => {
          this._alert.showError('Error guardando impresora');
        });
    }
  }

  protected async test() {
    this._printing.printTest();
    // await this._blue.getServices();
  }
}
