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
import { IClient } from 'src/app/models/client.model';
import { LocalClientService } from '../local/local-client/local-client.service';
import { ICoin } from 'src/app/models/coin.model';
import { ICoinCashbox } from 'src/app/models/coin-cashbox.model';
import { LocalCoinService } from '../local/local-coin/local-coin.service';
import { IInventoryCheck } from 'src/app/models/inventory-check.model';
import { LocalUnitsService } from '../local/local-units/local-units.service';
import { IInventoryCheckDetail } from 'src/app/models/inventory-check-detail.model';
import { IProduct } from 'src/app/models/product.model';
import { IUnit } from 'src/app/models/unit.model';
import { IInventoryIncome } from 'src/app/models/inventory-income.model';
import { IInventoryIncomeDetail } from 'src/app/models/inventory-income-detail.model';
import { LocalInventoryIncomeService } from '../local/local-inventory-income/local-inventory-income.service';
import { LocalInventoryIncomeDetailService } from '../local/local-inventory-income-detail/local-inventory-income-detail.service';
import { LocalInventoryCheckDetailsService } from '../local/local-inventory-check-details/local-inventory-check-details.service';
import { IBillInvoice } from 'src/app/models/bill-invoice.model';
import { LocalBillsService } from '../local/bills/bills.service';
import { LocalBillInvoiceService } from '../local/local-bill-invoice/local-bill-invoice.service';
import { IBill } from 'src/app/models/bill.model';

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
    private _toast: ToastService,
    private _client: LocalClientService,
    private _coin: LocalCoinService,
    private _units: LocalUnitsService,
    private _incomeDetail: LocalInventoryIncomeDetailService,
    private _checkDetails: LocalInventoryCheckDetailsService,
    private _bill: LocalBillsService,
    private _invoices: LocalBillInvoiceService,
  ) { }

  public async printPurchase(
    purchase: IPurchase,
    purchaseDetails: Array<IPurchaseDetail>,
    message: string = '¿Quiere imprimir un recibo de compra?'
  ) {
    const printer = await this._printer.getCurrentPrinter();
    if (!printer) {
      return;
    }

    const resp = await this._alert.showConfirm('Confirme', message);
    if (!resp) return;

    const report = new Report(this._stp);
    const client: IClient | undefined = purchase.idClient ? await this._client.get(purchase.idClient) : undefined;

    await report.addHeader();
    if (client) {
      if (purchase.isCredit) {
        await report.addLines('Venta a Credito', 'middle', 'large');
      } else {
        await report.addLines('Venta a Contado', 'middle', 'large');
      }
    } else {
      await report.addLines('Recibo de Venta', 'middle', 'large');
    }

    await report.fillLine();
    await report.addLines(`Factura: ${purchase.id.toString().padStart(5, '0')}`);
    await report.addLines(`Fecha: ${this._date.transform(purchase.date, 'dd/MM/yyyy hh:mm a')}`)
    if (client) {
      await report.addLines(`Cliente: ${client.name}`);
    }

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
    await report.addLines(`Total: $${this._number.transform(purchase.total, '1.2-2')}`, 'start', 'bold');
    // await report.fillLine();
    // await report.addLines('Gracias por su compra!', 'middle', 'bold');
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
    await report.addLines('Reporte de Ventas', 'middle', 'large');
    await report.addLines(`Desde: ${this._date.transform(new Date(cashbox.init), 'dd/MM/yyyy hh:mm a')}`);
    await report.addLines(`Hasta: ${this._date.transform(new Date(cashbox.end), 'dd/MM/yyyy hh:mm a')}`);
    await report.addLines(`Monto de inicio: $${this._number.transform(cashbox.initCash, '1.2-2')}`);
    await report.addLines(`Monto de cierre: $${this._number.transform(cashbox.endCash, '1.2-2')}`);
    // await report.fillLine();
    await report.fillLine('=');
    await report.addRow(['#Factura', 'Hora', 'Total'], 'bold');
    await report.fillLine('-');

    for (const purchase of purchases) {
      total += purchase.total;
      await report.addRow([
        purchase.id.toString().padStart(5, '0'),
        this._date.transform(new Date(purchase.date), 'hh:mm a')!,
        `$${this._number.transform(purchase.total, '1.2-2')}`
      ]);
    }
    await report.fillLine('=');
    await report.addLines(`Total: $${this._number.transform(total, '1.2-2')!}`, 'start', 'bold');
    await report.fillLine('', 5);

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

  public async printCashbox(cashbox: ICashBox, message: string) {
    const printer = await this._printer.getCurrentPrinter();
    if (!printer) {
      this._toast.showToast('No tiene impresora configurada');
      return;
    }

    const resp = await this._alert.showConfirm('Confirme', message);
    if (!resp) return;

    const detailsOpen = cashbox.coins.filter(coin => !coin.closing);
    const detailsClose = cashbox.coins.filter(coin => coin.closing);
    const infoOpen: Array<{ coin: ICoin, detail: ICoinCashbox }> = [];
    const infoClose: Array<{ coin: ICoin, detail: ICoinCashbox }> = [];

    for (const detail of detailsOpen) {
      infoOpen.push({
        coin: (await this._coin.get(detail.idCoin))!,
        detail: detail
      });
    }

    for (const detail of detailsClose) {
      infoClose.push({
        coin: (await this._coin.get(detail.idCoin))!,
        detail: detail
      });
    }

    const report = new Report(this._stp);
    await report.addHeader();

    await report.addLines('Caja', 'middle', 'large');

    await report.fillLine();
    // 
    await report.addLines(`Apertura: ${this._date.transform(cashbox.init, 'dd/MM/yyyy hh:mm a')}`);
    if (cashbox.end) await report.addLines(`Cierre: ${this._date.transform(cashbox.end, 'dd/MM/yyyy hh:mm a')}`);
    await report.addLines(`Inicial: $${this._number.transform(cashbox.initCash, '1.2-2')}`, 'start', 'bold');
    if (cashbox.endCash) await report.addLines(`Final: $${this._number.transform(cashbox.endCash, '1.2-2')}`, 'start', 'bold');
    await report.fillLine('=');

    await report.addLines('Apertura', 'middle', 'bold');
    await report.fillLine('-');
    await report.addRow(['Moneda', 'Cantidad', 'Total'], 'bold', 'space-between');
    await report.fillLine('-');
    for (const detail of infoOpen) {
      await report.addRow([
        this._number.transform(detail.coin.value, '1.2-2')!,
        this._number.transform(detail.detail.amount, '1.2-2')!,
        `$${this._number.transform((detail.coin.value * detail.detail.amount), '1.2-2')}`
      ], 'normal', 'space-between');
    }
    await report.fillLine('=');

    if (infoClose.length > 0) {
      await report.addLines('Cierre', 'middle', 'bold');
      await report.addRow(['Moneda', 'Cantidad', 'Total'], 'bold', 'space-between');
      await report.fillLine('-');
      for (const detail of infoClose) {
        await report.addRow([
          this._number.transform(detail.coin.value, '1.2-2')!,
          this._number.transform(detail.detail.amount, '1.2-2')!,
          `$${this._number.transform((detail.coin.value * detail.detail.amount), '1.2-2')}`
        ], 'normal', 'space-between');
      }
    } else {
      await report.addLines('Caja aun abierta', 'start', 'bold');
    }
    await report.fillLine('=');
    await report.fillLine(undefined, 5);
    await this._bluetooth
      .print(report.getIntArray())
      .then(() => {
        this._alert.showSuccess('Caja imprimida con éxito');
      })
      .catch((err) => {
        this._alert.showError('Error al imprimir caja');
        this._file.saveError(err);
      });
  }

  public async printInventoryIncome(
    income: IInventoryIncome, message: string = '¿Quiere imprimir la entrada de inventario?'
  ) {
    const printer = await this._printer.getCurrentPrinter();
    if (!printer) {
      return;
    }

    const resp = await this._alert.showConfirm('Confirme', message);
    if (!resp) return;

    const report = new Report(this._stp);
    const data = await firstValueFrom(forkJoin([
      this._product.getAll(), this._units.getAll(), this._incomeDetail.getAll()
    ]));
    const products = data[0];
    const units = data[1];
    const incomeDetails = data[2];
    const details: Array<{ detail: IInventoryIncomeDetail, product: IProduct, unit: IUnit, baseUnit: IUnit }> = [];
    income.details = incomeDetails.filter(detail => detail.id.idInventoryIncome == income.id);

    income.details.forEach(detail => {
      details.push({
        detail: detail,
        product: products.find(product => product.id == detail.id.idProduct)!,
        unit: units.find(unit => unit.id == detail.id.idUnit)!,
        baseUnit: units.find(unit => unit.id == detail.idBaseUnit)!
      });
    });

    await report.addHeader();
    await report.addLines('Entrada de inventario', 'middle', 'bold');
    // await report.fillLine();
    await report.addLines(`Fecha: ${this._date.transform(income.date, 'dd/MM/yyyy hh:mm a')}`);

    await report.fillLine('=');
    // await report.addLines('Detalles','middle','bold');
    // await report.fillLine('-');
    await report.addRow(['Producto', 'Unidad', 'U.Base'], 'bold', 'space-between');
    await report.addRow(['Cantidad', 'Cant.Base', 'Costo'], 'bold', 'space-between');
    await report.fillLine('-');
    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      await report.addRow([
        detail.product.name,
        detail.unit.name,
        detail.baseUnit.name
      ], 'normal', 'space-between');

      await report.addRow([
        this._number.transform(detail.detail.amount, '1.2-2')!,
        this._number.transform((detail.detail.amountBaseUnit || detail.detail.amount), '1.2-2')!,
        `$${this._number.transform(detail.detail.cost, '1.2-2')!}`
      ], 'normal', 'space-between');
      if (i < details.length - 1) await report.fillLine('-');
    }
    await report.fillLine('=');
    await report.addLines(`Total: $${this._number.transform(income.totalCost, '1.2-2')}`, 'start', 'bold');
    await report.fillLine('', 5);

    await this._bluetooth
      .print(report.getIntArray())
      .then(() => {
        this._alert.showSuccess('Ingreso a inventario impreso con éxito');
      })
      .catch((err) => {
        this._alert.showError('Error al imprimir ingreso a inventario');
        this._file.saveError(err);
      });
  }

  public async printInventoryCheck(check: IInventoryCheck, message: string = '¿Está seguro de imprimir el pase de inventario?') {
    const printer = await this._printer.getCurrentPrinter();
    if (!printer) {
      return;
    }

    const resp = await this._alert.showConfirm('Confirme', message);
    if (!resp) return;

    const report = new Report(this._stp);
    const data = await firstValueFrom(forkJoin([
      this._product.getAll(), this._units.getAll(), this._checkDetails.getAll()
    ]))
    const products = data[0];
    const units = data[1];
    const rawDetails = data[2];
    const details: Array<{ detail: IInventoryCheckDetail, product: IProduct, unit: IUnit, baseUnit: IUnit }> = [];
    check.details = rawDetails.filter(detail => detail.id.idInventoryCheck == check.id);

    check.details.forEach(detail => {
      details.push({
        detail: detail,
        product: products.find(product => product.id == detail.id.idProduct)!,
        unit: units.find(unit => unit.id == detail.id.idUnit)!,
        baseUnit: units.find(unit => unit.id == detail.idBaseUnit)!
      });
    });

    await report.addHeader();
    await report.addLines('Pase de inventario', 'middle', 'bold');
    await report.addLines(`Fecha: ${this._date.transform(check.date, 'dd/MM/yyyy hh:mm a')}`);
    await report.addLines(`Contados: ${details.length}`);

    await report.fillLine('=');
    await report.addRow([
      'Producto',
      'Unidad',
      'B.Unidad'
    ], 'bold', 'space-between');
    await report.addRow([
      '',
      'Cantidad',
      'Cant.Base'
    ], 'bold', 'space-between');
    await report.fillLine('-');
    for (let i = 0; i < details.length; i++) {
      const detail = details[i];
      await report.addRow([
        detail.product.name,
        detail.unit.name,
        detail.baseUnit.name
      ], 'normal', 'space-between');
      await report.addRow([
        '',
        this._number.transform(detail.detail.amount, '1.2-2')!,
        this._number.transform(detail.detail.amountBaseUnit || detail.detail.amount, '1.2-2')!
      ], 'normal', 'space-between');
      if (i < details.length - 1) await report.fillLine('-');
    }
    await report.fillLine('=');
    await report.fillLine('', 5);

    await this._bluetooth
      .print(report.getIntArray())
      .then(() => {
        this._alert.showSuccess('Pase de inventario impreso con éxito');
      })
      .catch((err) => {
        this._alert.showError('Error al imprimir pase de inventario');
        this._file.saveError(err);
      });
  }

  public async printBillInvoice(invoice: IBillInvoice, message: string = '¿Está seguro de imprimir el abono a factura?') {
    const printer = await this._printer.getCurrentPrinter();
    if (!printer) {
      return;
    }

    const resp = await this._alert.showConfirm('Confirme', message);
    if (!resp) return;

    const report = new Report(this._stp);

    const data = await firstValueFrom(forkJoin([
      this._bill.get(invoice.idBill),
      this._purchase.get(invoice.idBill)
    ]));
    const bill = data[0];
    const purchase = data[1];
    const client = await this._client.get(purchase!.idClient!);

    await report.addHeader();
    await report.addLines('Abono a factura','middle','bold');
    await report.addLines(`Fecha: ${this._date.transform(invoice.date, 'dd/MM/yyyy hh:mm a')}`);
    await report.addLines(`Factura: ${invoice.idBill.toString().padStart(5,'0')}`);
    await report.addLines(`Cliente: ${client!.name}`);
    await report.addLines(`Pagado: $${this._number.transform(bill!.balance, '1.2-2')}`);
    await report.addLines(`Por pagar: $${this._number.transform(bill!.total - bill!.balance, '1.2-2')}`);
    await report.addLines(`Abonado: $${this._number.transform(invoice.amount,'1.2-2')}`,'start','bold');
    await report.fillLine('=');
    await report.fillLine('',5);

    await this._bluetooth
      .print(report.getIntArray())
      .then(() => {
        this._alert.showSuccess('Abono a factura impreso con éxito');
      })
      .catch((err) => {
        this._alert.showError('Error al imprimir abono a factura');
        this._file.saveError(err);
      });
  }

  public async printBill(bill: IBill, message: string = '¿Está seguro de imprimir la factura?'){
    const printer = await this._printer.getCurrentPrinter();
    if (!printer) {
      return;
    }

    const resp = await this._alert.showConfirm('Confirme', message);
    if (!resp) return;

    const report = new Report(this._stp);
    
    const data = await firstValueFrom(forkJoin([
      this._invoices.getAll(),
      this._client.getAll(),
      this._purchase.get(bill.id)
    ]));
    const invoices = data[0].filter(invoice => invoice.idBill == bill.id);
    const purchase = data[2];
    const client = data[1].find(client => client.id == purchase!.idClient);

    await report.addHeader();
    await report.addLines('Factura', 'middle','large');
    await report.addLines(`#Factura: ${bill.id.toString().padStart(5,'0')}`);
    await report.addLines(`F. emision: ${this._date.transform(purchase!.date, 'dd/MM/yyyy hh:mm a')}`);
    await report.addLines(`Cliente: ${client!.name}`);
    await report.addLines(`Total: $${this._number.transform(bill.total, '1.2-2')}`);
    await report.addLines(`Pagado: $${this._number.transform(bill.balance, '1.2-2')}`);
    await report.addLines(`Por pagar: $${this._number.transform(bill.total - bill.balance, '1.2-2')}`);
    await report.fillLine('=');
    
    await report.addLines('Abonos','middle','bold');
    await report.fillLine('-');
    await report.addRow([
      'Fecha','Hora','Total',
    ],'bold','space-between');
    await report.fillLine('-');
    for(let i = 0; i < invoices.length;i++){
      const invoice = invoices[i];
      await report.addRow([
        this._date.transform(invoice.date, 'dd/MM/yy')!,
        this._date.transform(invoice.date,'hh:mma')!,
        `$${this._number.transform(invoice.amount, '1.2-2')}`
      ],'normal','space-between');
      if(i < invoices.length - 1) await report.fillLine('-');
    }
    await report.fillLine('=');
    await report.fillLine('',5);

    await this._bluetooth
      .print(report.getIntArray())
      .then(() => {
        this._alert.showSuccess('Factura imprimida con éxito');
      })
      .catch((err) => {
        this._alert.showError('Error al imprimir factura');
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
