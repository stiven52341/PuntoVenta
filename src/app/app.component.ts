import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonLabel, IonItem, IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ["app.component.scss"],
  imports: [NgIf,IonButton,IonIcon,NgFor,IonLabel,IonItem,IonList,IonApp, IonRouterOutlet, IonMenu, IonHeader, IonToolbar, IonTitle,IonContent],
})
export class AppComponent {
  protected menuOptions: Array<{title: string, path: string, icon?: string, image?: string, do: () => Promise<void> | void}>;

  constructor() {
    this.menuOptions = [
      {
        title: 'Productos',
        path: '/products',
        image: '../assets/icon/apple.png',
        do: () => {}
      },
      {
        title: 'Inventario',
        path: '/inventory',
        image: '../assets/icon/inventory.png',
        do: () => {}
      },
      {
        title: 'Mantenimientos',
        path: '/mants',
        image: '../assets/icon/pencil.png',
        do: () => {}
      },
    ];

    addIcons({});
  }
}
