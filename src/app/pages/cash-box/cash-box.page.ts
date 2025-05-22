import { LocalPurchaseService } from './../../services/local/local-purchase/local-purchase.service';
import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { ButtonListComponent } from 'src/app/components/button-list/button-list.component';
import { CircleGraphComponent } from 'src/app/components/charts/circle-graph/circle-graph.component';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { LocalCashBoxService } from 'src/app/services/local/local-cash-box/local-cash-box.service';
import { ModalsService } from 'src/app/services/modals/modals.service';

@Component({
  selector: 'app-cash-box',
  templateUrl: './cash-box.page.html',
  styleUrls: ['./cash-box.page.scss'],
  standalone: true,
  imports: [
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    ButtonListComponent,
    DecimalPipe,
    CircleGraphComponent,
  ],
})
export class CashBoxPage implements ViewWillEnter {
  protected buttons: Array<IButton>;
  protected openedWith: number = 0;
  protected balance: number = 0;
  protected loading: boolean = false;
  protected circleGraphData: Array<{ name: string; value: number }> = [];

  constructor(
    private _modal: ModalsService,
    private _localCash: LocalCashBoxService,
    private _localSells: LocalPurchaseService
  ) {
    this.buttons = [
      {
        title: 'Abrir caja',
        image: '../../../assets/icon/open-cash.png',
        do: async () => {
          const result = await this._modal.showCashbox('open');
          if(!result) return;
          this.openedWith = result;
          this.balance = this.openedWith;
          this.buttons[0].disable = true;
          this.buttons[1].disable = false;
        },
      },
      {
        title: 'Cerrar caja',
        image: '../../../assets/icon/close-cash.png',
        do: async () => {
          this.balance =
            (await this._modal.showCashbox('close', this.balance)) || 0;
          this.buttons[0].disable = false;
          this.buttons[1].disable = true;
        },
      },
    ];
  }

  private async onInit() {
    const cashbox = await this._localCash.getOpenedCashbox();

    if (cashbox) {
      this.buttons[0].disable = true;
      this.buttons[1].disable = false;
      this.openedWith = cashbox.initCash;
      this.balance = await this._localCash.calculateBalance();
    } else {
      this.buttons[0].disable = false;
      this.buttons[1].disable = true;
    }

    this.circleGraphData = [
      {
        name: 'Testing 1',
        value: 50,
      },
      {
        name: 'Testing 2',
        value: 50,
      },
    ];
  }

  async ionViewWillEnter() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }
}
