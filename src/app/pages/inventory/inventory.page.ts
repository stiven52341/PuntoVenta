import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: true,
  imports: [HeaderBarComponent,IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class InventoryPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
