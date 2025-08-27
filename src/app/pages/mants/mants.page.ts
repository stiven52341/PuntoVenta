import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { ButtonListComponent } from 'src/app/components/button-list/button-list.component';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';

@Component({
  selector: 'app-mants',
  templateUrl: './mants.page.html',
  styleUrls: ['./mants.page.scss'],
  standalone: true,
  imports: [IonContent, HeaderBarComponent, IonHeader, FormsModule, ButtonListComponent]
})
export class MantsPage implements OnInit {
  protected readonly buttons: Array<IButton>;

  constructor(private _router: Router) {
    this.buttons = [
      {
        title: 'PRODUCTOS',
        do: async () => {
          await this._router.navigate(['/mant/products']);
        },
        image: '../../../assets/icon/apple.png'
      },
      {
        title: 'PRECIOS',
        do: async () => {
          await this._router.navigate(['/mant/prices']);
        },
        image: '../../../assets/icon/price.png'
      },
      {
        title: 'UNIDADES',
        do: async () => {
          await this._router.navigate(['/mant/units']);
        },
        image: '../../../assets/icon/box.png'
      },
      {
        title: 'CATEGORÍAS',
        do: async () => {
          await this._router.navigate(['/mant/categories']);
        },
        image: '../../../assets/icon/category.png'
      },
      {
        title: 'Establecer unidad base para todos los productos',
        image: '../../../assets/icon/box-income.png',
        do: async() => {
          
        }
      }
    ];
  }

  ngOnInit() {
  }

}
