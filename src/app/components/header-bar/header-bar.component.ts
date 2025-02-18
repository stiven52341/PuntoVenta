import { IonToolbar, IonButtons, IonTitle, MenuController, IonButton, IonIcon } from '@ionic/angular/standalone';
import { Component, Input, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { menu } from 'ionicons/icons';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss'],
  standalone: true,
  imports: [IonIcon, IonButton, IonTitle, IonButtons, IonToolbar, UpperCasePipe]
})
export class HeaderBarComponent  implements OnInit {
  @Input({required: true}) title!: string;

  constructor(private _menuCtrl: MenuController) {
    addIcons({menu})
  }

  ngOnInit() {}

  public async openMenu(){
    await this._menuCtrl.toggle('main-menu');
  }
}
