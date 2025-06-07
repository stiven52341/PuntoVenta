import { Injectable } from '@angular/core';
import { IPurchase } from 'src/app/models/purchase.model';
import { AlertsService } from '../alerts/alerts.service';
import { Report } from '../../models/report.class';
import { StringToPrintService } from '../string-to-print/string-to-print.service';
import { LocalProductsService } from '../local/local-products/local-products.service';
import { LocalUnitProductsService } from '../local/local-unit-products/local-unit-products.service';
import { BluetoothService } from '../bluetooth/bluetooth.service';
import { FilesService } from '../files/files.service';

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
    private _file: FilesService
  ) {}

  public async printPurchase(
    purchase: IPurchase,
    mensaje: string = '¿Quiere imprimir un recibo de compra?'
  ) {
    const resp = await this._alert.showConfirm('Confirme', mensaje);
    if (!resp) return;

    const report = new Report(this._stp);

    report.addHeader();
    report.addLines('Recibo de Compra', 'middle', 'large');
    report.fillLine('=');
    report.addRow(
      ['Producto', 'Cantidad', 'Precio', 'Total'],
      'bold',
      'center'
    );
    report.fillLine('-');

    for (const detail of purchase.details!) {
      const price = await this._price.get(detail.id.idUnitProductCurrency);
      const product = await this._product.get(price!.idProduct);
      report.addRow([
        product!.name,
        detail!.amount.toFixed(2),
        detail!.priceUsed.toFixed(2),
        (detail.amount * detail.priceUsed).toFixed(2),
      ]);
    }

    report.fillLine('=');
    report.addLines(`Cant. Productos: ${purchase.details?.length}`);
    report.addLines(`Total: ${purchase.total.toFixed(2)}`);
    report.fillLine(undefined, 5);

    await this._bluetooth.print(report.getIntArray()).then(() => {
      this._alert.showSuccess('Compra imprimida con éxito');
    }).catch(err => {
      this._alert.showError('Error al imprimir compra');
      this._file.saveError(err);
    });
  }

  public async printTest(){
    const report = new Report(this._stp);
    report.addLines('Prueba de impresion', 'middle', 'large');
    report.fillLine(undefined, 3);
    report.addLines('Prueba de tamannos:');
    report.addLines('Normal');
    report.addLines('Negrita', 'start','bold');
    report.addLines('Grande', 'start', 'large');
    report.addLines('Muy grande', 'start','larger');
    report.fillLine();
    report.addLines('Prueba de posiciones:');
    report.addLines('Inicio');
    report.addLines('Medio', 'middle');
    report.addLines('Final', 'end');
    report.fillLine();
    report.addLines('Prueba de tablas:');
    report.addRow(['column1', 'column2', 'column3', 'column4']);
    report.addRow(['column1', 'column2', 'column3', 'column4'], 'normal','center');
    report.addRow(['column1', 'column2', 'column3', 'column4'], 'normal','end');
    report.addRow(['column1', 'column2', 'column3', 'column4'], 'normal','space-between');
    this._bluetooth.print(report.getIntArray());
  }
}
