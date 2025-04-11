import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-mant-categories',
  templateUrl: './mant-categories.page.html',
  styleUrls: ['./mant-categories.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MantCategoriesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
