import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { ButtonListComponent } from 'src/app/components/elements/button-list/button-list.component';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { ModalsService } from 'src/app/services/modals/modals.service';

@Component({
  selector: 'app-cxc',
  templateUrl: './cxc.page.html',
  styleUrls: ['./cxc.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, HeaderBarComponent, ButtonListComponent]
})
export class CxcPage implements OnInit {
  protected list: Array<IButton>;

  constructor(private _router: Router, private _modal: ModalsService) {
    this.list = [
      {
        title: 'Facturas pendientes',
        image: '../../../assets/icon/late-payment.png',
        do: async () => {
          const client = await this._modal.showClientsList(true);
          if(!client) return;
          await this._router.navigate(['/home/cxc/bill', client.id]);
        }
      }
    ];
  }

  ngOnInit() {
  }

}
