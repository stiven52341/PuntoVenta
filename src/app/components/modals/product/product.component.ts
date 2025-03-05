import { Component, Input, OnInit } from '@angular/core';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../header-bar/header-bar.component';
import { IProduct } from 'src/app/models/product.model';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  imports: [IonHeader, HeaderBarComponent, IonContent]
})
export class ProductComponent  implements OnInit {
  @Input({required:true}) product!: IProduct;
  @Input() image?: string;

  constructor() { }

  ngOnInit() {}

}
