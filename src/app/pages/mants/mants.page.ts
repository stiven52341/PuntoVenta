import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';

@Component({
  selector: 'app-mants',
  templateUrl: './mants.page.html',
  styleUrls: ['./mants.page.scss'],
  standalone: true,
  imports: [IonContent, HeaderBarComponent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule]
})
export class MantsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
