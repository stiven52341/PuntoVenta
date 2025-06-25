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
import { DecimalPipe } from '@angular/common';

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
    private _number: DecimalPipe
  ) {}

  public async printPurchase(
    purchase: IPurchase,
    purchaseDetails: Array<IPurchaseDetail>,
    mensaje: string = '¿Quiere imprimir un recibo de compra?'
  ) {
    const printer = await this._printer.getCurrentPrinter();
    if(!printer){
      return;
    }

    const resp = await this._alert.showConfirm('Confirme', mensaje);
    if (!resp) return;
    
    const report = new Report(this._stp);

    report.addHeader();
    report.addLines('Recibo de Compra', 'middle', 'large');
    report.fillLine('=');

    report.addRow(
      ['Cantidad', 'Precio', 'Total'],
      'bold',
      'center'
    );
    
    report.fillLine('-');

    for (const detail of purchaseDetails) {
      const price = await this._price.get(detail.id.idUnitProductCurrency);
      const product = await this._product.get(price!.idProduct);
      report.addLines(product!.name);
      report.addRow([
        `${this._number.transform(detail!.amount, '1.2-2')}`,
        `$${this._number.transform(detail!.priceUsed, '1.2-2')}`,
        `$${this._number.transform(detail.amount * detail.priceUsed, '1.2-2')}`,
      ], 'normal', 'center');
    }

    report.fillLine('=');
    report.addLines(`Cant. Productos: ${purchaseDetails.length}`);
    report.addLines(`Total: $${this._number.transform(purchase.total, '1.2-2')}`);
    report.fillLine();
    report.addLines('Gracias por su compra!', 'middle', 'bold');
    report.fillLine(undefined, 5);

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
