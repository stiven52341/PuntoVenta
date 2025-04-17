import { Component, Input, OnInit } from '@angular/core';
import { IonContent, IonHeader } from "@ionic/angular/standalone";
import { HeaderBarComponent } from '../../header-bar/header-bar.component';
import { IUnitProduct } from 'src/app/models/unit-product.model';

@Component({
  selector: 'app-prices',
  templateUrl: './prices.component.html',
  styleUrls: ['./prices.component.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, HeaderBarComponent]
})
export class PricesComponent  implements OnInit {
  @Input() prices: Array<IUnitProduct> = [];

  constructor() { }

  ngOnInit() {}

}
