import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { ButtonListComponent } from 'src/app/components/button-list/button-list.component';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
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
      }
    ];
  }

  ngOnInit() {
  }

}
