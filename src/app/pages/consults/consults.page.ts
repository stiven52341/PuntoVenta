import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { ButtonListComponent } from 'src/app/components/elements/button-list/button-list.component';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { ModalsService } from 'src/app/services/modals/modals.service';

@Component({
  selector: 'app-consults',
  templateUrl: './consults.page.html',
  styleUrls: ['./consults.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, HeaderBarComponent, ButtonListComponent]
})
export class ConsultsPage implements OnInit {

  protected buttons: Array<IButton>;

  constructor(private _router: Router, private _modal: ModalsService) {
    this.buttons = [
      {
        title: 'VENTAS',
        do: async () => {
          const result = await this._modal.showSellsList();
          if(!result) return;
          await this._router.navigate(['/consults/sells', result.id]);
        },
        image: '../../../assets/icon/sell.png'
      },
      {
        title: 'COMPRAS DE MERCANCÍA',
        image: '../../../assets/icon/inventory-income.png',
        do: async () => {
          const income = await this._modal.showInventoryIncomesList();
          if(!income) return;
          this._router.navigate(['consults/product-income', income.id]);
        }
      },
      {
        title: 'PASES DE INVENTARIO',
        image: '../../../assets/icon/inventory-ajust.png',
        do: async() => {
          const check = await this._modal.showInventoryChecksList();
          if(!check) return;
          this._router.navigate(['consults/inventory-checks/', check.id]);
        }
      },
      {
        title: 'CAJAS',
        image: '../../../assets/icon/cash-box.png',
        do: async() => {
          const cashbox = await this._modal.showCashBoxesList();
          if(!cashbox) return;
          this._router.navigate(['consults/cash-box/', cashbox.id]);
        }
      }
    ];
  }

  ngOnInit() {
  }

}
