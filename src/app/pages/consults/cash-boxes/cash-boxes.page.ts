import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonContent, IonFooter, IonHeader, IonIcon, IonImg, IonItem, IonLabel, IonList, IonListHeader } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { save } from 'ionicons/icons';
import { firstValueFrom, forkJoin } from 'rxjs';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { ICashBox } from 'src/app/models/cash-box.model';
import { ICoinCashbox } from 'src/app/models/coin-cashbox.model';
import { ICoin } from 'src/app/models/coin.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { LocalCashBoxService } from 'src/app/services/local/local-cash-box/local-cash-box.service';
import { LocalCoinService } from 'src/app/services/local/local-coin/local-coin.service';
import { LocalPrinterService } from 'src/app/services/local/local-printer/printer.service';
import { PrintingService } from 'src/app/services/printing/printing.service';

@Component({
  selector: 'app-cash-boxes',
  templateUrl: './cash-boxes.page.html',
  styleUrls: ['./cash-boxes.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, HeaderBarComponent,
    IonCard, IonCardContent,IonImg, IonLabel,
    DatePipe, DecimalPipe, IonCardHeader, IonCardTitle,
    IonList, IonItem, IonFooter, IonButton, IonIcon
  ]
})
export class CashBoxesPage implements OnInit {
  protected loading: boolean = false;
  protected cashbox?: ICashBox;
  protected coinsFromOpen: Array<{ relation: ICoinCashbox, coin: ICoin }> = [];
  protected coinsFromClose: Array<{ relation: ICoinCashbox, coin: ICoin }> = [];
  protected isPrinter: boolean = false;

  constructor(
    private _route: ActivatedRoute, private _cashbox: LocalCashBoxService,
    private _router: Router, private _alert: AlertsService, private _localCoin: LocalCoinService,
    protected _localPrinter: LocalPrinterService, private _print: PrintingService
  ) {
    addIcons({save});
  }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init() {
    const id = this._route.snapshot.params['id'] as number;
    this.cashbox = await this._cashbox.get(id);
    if (!this.cashbox) {
      this._alert.showError(`No se encontró la caja #${id}`);
      this._router.navigate(['/home/consults']);
      return;
    }

    this._localPrinter.getCurrentPrinter().then(printer => {
      this.isPrinter = printer ? true : false;
    });

    const fromOpen = this.cashbox.coins.filter(coin => !coin.closing);
    const fromClose = this.cashbox.coins.filter(coin => coin.closing);
    const coins = await this._localCoin.getAll();

    for(const detail of fromOpen){
      const coin = coins.find(coin => coin.id == detail.idCoin);
      this.coinsFromOpen.push({ relation: detail, coin: coin! });
    }

    for(const detail of fromClose){
      const coin = coins.find(coin => coin.id == detail.idCoin);
      this.coinsFromClose.push({ relation: detail, coin: coin! });
    }
  }

  protected async onPrint(){
    if(!this.cashbox) return;
    await this._print.printCashbox(this.cashbox, '¿Está seguro de reimprimir caja?');
  }
}
