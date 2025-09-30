import { Injectable } from '@angular/core';
import { IPurchase } from 'src/app/models/purchase.model';
import { AlertsService } from '../alerts/alerts.service';
import { Report } from '../../models/report.class';
import { StringToPrintService } from '../string-to-print/string-to-print.service';
import { LocalProductsService } from '../local/local-products/local-products.service';
import { LocalUnitProductsService } from '../local/local-unit-products/local-unit-products.service';
import { BluetoothService } from '../bluetooth/bluetooth.service';
import { FilesService } from '../files/files.service';
import { IPurchaseDetail } from 'src/app/models/purchase-detail.model';
import { LocalPrinterService } from '../local/local-printer/printer.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { ICashBox } from 'src/app/models/cash-box.model';
import { firstValueFrom, forkJoin } from 'rxjs';
import { LocalPurchaseService } from '../local/local-purchase/local-purchase.service';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root',
})
export class PrintingService {
  constructor(
    private _bluetooth: BluetoothService,
    private _alert: AlertsService,
    private _stp: StringToPrintService,
    private _price: LocalUnitProductsService,
    private _product: LocalProductsService,
    private _file: FilesService,
    private _printer: LocalPrinterService,
    private _number: DecimalPipe,
    private _date: DatePipe,
    private _purchase: LocalPurchaseService,
    private _toast: ToastService
  ) { }

  public async printPurchase(
    purchase: IPurchase,
    purchaseDetails: Array<IPurchaseDetail>,
    mensaje: string = '¿Quiere imprimir un recibo de compra?'
  ) {
    const printer = await this._printer.getCurrentPrinter();
    if (!printer) {
      return;
    }

    const resp = await this._alert.showConfirm('Confirme', mensaje);
    if (!resp) return;

    const report = new Report(this._stp);

    report.addHeader();
    await report.addLines('Recibo de Compra', 'middle', 'large');
    await report.fillLine('=');

    await report.addRow(
      ['Cantidad', 'Precio', 'Total'],
      'bold',
      'center'
    );

    await report.fillLine('-');

    for (const detail of purchaseDetails) {
      const price = await this._price.get(detail.id.idUnitProductCurrency);
      const product = await this._product.get(price!.idProduct);
      await report.addLines(product!.name);
      await report.addRow([
        `${this._number.transform(detail!.amount, '1.2-2')}`,
        `$${this._number.transform(detail!.priceUsed, '1.2-2')}`,
        `$${this._number.transform(detail.amount * detail.priceUsed, '1.2-2')}`,
      ], 'normal', 'center');
    }

    await report.fillLine('=');
    await report.addLines(`Cant. Productos: ${purchaseDetails.length}`);
    await report.addLines(`Total: $${this._number.transform(purchase.total, '1.2-2')}`);
    await report.fillLine();
    await report.addLines('Gracias por su compra!', 'middle', 'bold');
    await report.fillLine(undefined, 5);

    await this._bluetooth
      .print(report.getIntArray())
      .then(() => {
        this._alert.showSuccess('Compra imprimida con éxito');
      })
      .catch((err) => {
        this._alert.showError('Error al imprimir compra');
        this._file.saveError(err);
      });
  }

  public async printSells(
    cashbox: ICashBox,
    message: string = '¿Quiere imprimir el reporte de ventas?'
  ) {
    const printer = await this._printer.getCurrentPrinter();
    if (!printer) {
      this._toast.showToast('No tiene impresora configurada');
      return;
    }

    if (cashbox.state != false || !cashbox.end) {
      this._alert.showError('La caja no está cerrada');
      return;
    }

    const resp = await this._alert.showConfirm('Confirme', message);
    if (!resp) return;

    const purchases = (await this._purchase.getPurchasesByDates(new Date(cashbox.init), new Date(cashbox.end)))
      .sort((a, b) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

    if (purchases.length == 0) {
      this._alert.showError('No se encontraron ventas');
      return;
    }

    const report = new Report(this._stp);
    let total: number = 0;

    report.addHeader();
    await report.addLines('Reporte de Ventas', 'middle', 'bold');
    await report.addLines(`Desde: ${this._date.transform(new Date(cashbox.init), 'dd/MM/yyyy hh:mm a')}`);
    await report.addLines(`Hasta: ${this._date.transform(new Date(cashbox.end), 'dd/MM/yyyy hh:mm a')}`);
    await report.addLines(`Monto de inicio: $${this._number.transform(cashbox.initCash, '1.2-2')}`);
    await report.addLines(`Monto de cierre: $${this._number.transform(cashbox.endCash, '1.2-2')}`);
    await report.fillLine();
    await report.fillLine('=');
    await report.addRow(['Hora', 'Total'], 'bold');
    await report.fillLine('-');

    for(const purchase of purchases){
      total += purchase.total;
      await report.addRow([
        this._date.transform(new Date(purchase.date), 'hh:mm a')!,
        `$${this._number.transform(purchase.total, '1.2-2')}`
      ]);
    }
    await report.fillLine('=');
    await report.addRow(['Total:', `$${this._number.transform(total, '1.2-2')!}`],'bold');
    await report.fillLine('',5);

    await this._bluetooth
      .print(report.getIntArray())
      .then(() => {
        this._alert.showSuccess('Ventas imprimidas con éxito');
      })
      .catch((err) => {
        this._alert.showError('Error al imprimir ventas');
        this._file.saveError(err);
      });
  }

  public async printTest() {
    const report = new Report(this._stp);
    report.addLines('Prueba de impresion', 'middle', 'large');
    report.fillLine();
    report.addLines('Prueba de tamannos:');
    report.addLines('Normal');
    report.addLines('Negrita', 'start', 'bold');
    report.addLines('Grande', 'start', 'large');
    report.addLines('Muy grande', 'start', 'larger');
    report.fillLine();
    report.addLines('Prueba de posiciones:');
    report.addLines('Inicio');
    report.addLines('Medio', 'middle');
    report.addLines('Final', 'end');
    report.fillLine();
    report.addLines('Prueba de tablas:');
    report.addRow(['column1', 'column2', 'column3', 'column4']);
    report.addRow(
      ['column1', 'column2', 'column3', 'column4'],
      'normal',
      'center'
    );
    report.addRow(
      ['column1', 'column2', 'column3', 'column4'],
      'normal',
      'end'
    );
    report.addRow(
      ['column1', 'column2', 'column3', 'column4'],
      'normal',
      'space-between'
    );
    report.fillLine(undefined, 3);
    this._bluetooth.print(report.getIntArray());
  }
}
