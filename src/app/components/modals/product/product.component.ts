import { Component, Input, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonTabButton, IonButton, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../header-bar/header-bar.component';
import { IProduct } from 'src/app/models/product.model';
import { addIcons } from 'ionicons';
import { heart, shareSocial } from 'ionicons/icons';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonButton, IonHeader, HeaderBarComponent, IonContent]
})
export class ProductComponent  implements OnInit {
  @Input({required:true}) product!: IProduct;
  @Input() image?: string;

  constructor() {
    addIcons({heart, shareSocial});
  }

  ngOnInit() {}

}
