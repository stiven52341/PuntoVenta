import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFooter, IonHeader, IonIcon, IonImg, IonLabel } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { print, save } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IBillInvoice } from 'src/app/models/bill-invoice.model';
import { IBill } from 'src/app/models/bill.model';
import { IClient } from 'src/app/models/client.model';
import { IPurchase } from 'src/app/models/purchase.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { LocalBillsService } from 'src/app/services/local/bills/bills.service';
import { LocalBillInvoiceService } from 'src/app/services/local/local-bill-invoice/local-bill-invoice.service';
import { LocalClientService } from 'src/app/services/local/local-client/local-client.service';
import { LocalPrinterService } from 'src/app/services/local/local-printer/printer.service';
import { LocalPurchaseService } from 'src/app/services/local/local-purchase/local-purchase.service';
import { PrintingService } from 'src/app/services/printing/printing.service';

@Component({
  selector: 'app-bill-invoice',
  templateUrl: './bill-invoice.page.html',
  styleUrls: ['./bill-invoice.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    HeaderBarComponent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonLabel,
    IonImg,
    DecimalPipe,
    DatePipe,
    IonFooter,
    IonButton,
    IonIcon
  ]
})
export class BillInvoicePage implements OnInit {
  protected loading: boolean = false;
  protected invoice?: IBillInvoice;
  protected client?: IClient;
  protected bill?: IBill;
  protected purchase?: IPurchase;
  protected isPrinter: boolean = false;

  constructor(
    private _route: ActivatedRoute,
    private _invoice: LocalBillInvoiceService,
    private _alert: AlertsService,
    private _router: Router,
    private _client: LocalClientService,
    private _purchase: LocalPurchaseService,
    private _bill: LocalBillsService,
    private _localPrinter: LocalPrinterService,
    private _print: PrintingService
  ) {
    addIcons({print})
  }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init() {
    const id = this._route.snapshot.params['id'] as number;
    this.invoice = await this._invoice.get(id);
    if (!this.invoice) {
      this._alert.showError(`No se encontró el abono #${id}`);
      this._router.navigate(['/consults']);
      return;
    }

    this._localPrinter.getCurrentPrinter().then((printer) => {
      this.isPrinter = printer ? true : false;
    });

    this.purchase = await this._purchase.get(this.invoice.idBill);
    const data = await firstValueFrom(forkJoin([
      this._bill.get(this.invoice.idBill),
      this._client.get(this.purchase!.idClient!),
    ]));
    this.bill = data[0];
    this.client = data[1];
  }
}
