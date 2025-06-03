import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonSegmentButton, IonIcon, IonLabel, IonSegmentView, IonSegment } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { print } from 'ionicons/icons';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { PrinterConfigComponent } from './printer-config/printer-config.component';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
  standalone: true,
  imports: [IonSegment, IonLabel,IonSegmentView,PrinterConfigComponent, IonIcon, IonSegmentButton,IonSegment, IonToolbar, IonContent, IonHeader, HeaderBarComponent]
})
export class ConfigPage implements OnInit {

  constructor() {
    addIcons({print})
  }

  ngOnInit() {
  }

}
