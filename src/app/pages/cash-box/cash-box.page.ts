import { DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  ViewWillEnter,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ButtonListComponent } from 'src/app/components/button-list/button-list.component';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { GlobalService } from 'src/app/services/global/global.service';
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
  ],
})
export class CashBoxPage implements ViewWillEnter {
  protected buttons: Array<IButton>;
  protected openedWith: number = 0;
  protected balance: number = 0;
  protected loading: boolean = false;

  private subs: Array<Subscription> = [];

  constructor(
    private _modal: ModalsService,
    private _localCash: LocalCashBoxService
  ) {
    this.buttons = [
      {
        title: 'Abrir caja',
        image: '../../../assets/icon/open-cash.png',
        do: async () => {
          this.openedWith = (await this._modal.showCashbox('open')) || 0;
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
  }

  async ionViewWillEnter() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }
}
