import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonLabel, IonCard, IonCardHeader, IonCardTitle } from '@ionic/angular/standalone';
import { ButtonListComponent } from 'src/app/components/button-list/button-list.component';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { ModalsService } from 'src/app/services/modals/modals.service';

@Component({
  selector: 'app-cash-box',
  templateUrl: './cash-box.page.html',
  styleUrls: ['./cash-box.page.scss'],
  standalone: true,
  imports: [IonCardTitle, IonCardHeader, IonCard, IonLabel, IonContent, IonHeader, HeaderBarComponent, ButtonListComponent]
})
export class CashBoxPage implements OnInit {
  protected buttons: Array<IButton>;

  constructor(private _modal: ModalsService) {
    this.buttons = [
      {
        title: 'Abrir caja',
        image: '../../../assets/icon/open-cash.png',
        do: async () => {
          await this._modal.showCashbox('open');
        }
      },
      {
        title: 'Cerrar caja',
        image: '../../../assets/icon/close-cash.png',
        do: async () => {
          await this._modal.showCashbox('close');
        }
      },
    ];
  }

  ngOnInit() {
  }

}
