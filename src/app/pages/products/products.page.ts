import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';

@Component({
  selector: 'app-products',
  templateUrl: './products.page.html',
  styleUrls: ['./products.page.scss'],
  standalone: true,
  imports: [IonContent,HeaderBarComponent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class ProductsPage implements OnInit {

  constructor() { }

  async ngOnInit() {

  }

}
