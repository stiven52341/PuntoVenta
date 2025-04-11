import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-mant-units',
  templateUrl: './mant-units.page.html',
  styleUrls: ['./mant-units.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MantUnitsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
