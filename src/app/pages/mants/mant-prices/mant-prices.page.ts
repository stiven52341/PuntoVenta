import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-mant-prices',
  templateUrl: './mant-prices.page.html',
  styleUrls: ['./mant-prices.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MantPricesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
