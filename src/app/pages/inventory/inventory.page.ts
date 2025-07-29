import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { ButtonListComponent } from 'src/app/components/button-list/button-list.component';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: true,
  imports: [HeaderBarComponent,IonContent, IonHeader,ButtonListComponent]
})
export class InventoryPage implements OnInit {
  protected readonly buttons: Array<IButton>;

  constructor(private _router: Router) {
    this.buttons = [
      {
        title: 'Compra de mercancía'.toUpperCase(),
        image: '../../../assets/icon/inventory-income.png',
        do: () => {
          this._router.navigate(['/inventory/products-purchase']);
        }
      }
    ];
  }

  ngOnInit() {
  }

}
