import {
  IonToolbar,
  IonButtons,
  IonTitle,
  MenuController,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonTabButton,
} from '@ionic/angular/standalone';
import { Component, Input, OnInit } from '@angular/core';
import { NgIf, UpperCasePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { cart, menu, arrowBack } from 'ionicons/icons';
import { ModalsService } from 'src/app/services/modals/modals.service';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss'],
  standalone: true,
  imports: [
    NgIf,
    IonProgressBar,
    IonIcon,
    IonButton,
    IonTitle,
    IonButtons,
    IonToolbar,
    UpperCasePipe,
  ],
})
export class HeaderBarComponent implements OnInit {
  @Input({ required: true }) title!: string;
  @Input() loading: boolean = false;
  @Input() showCart: boolean = false;
  @Input() arrowBack: boolean = false;

  constructor(private _menuCtrl: MenuController, private _modal: ModalsService) {
    addIcons({arrowBack,menu,cart});
  }

  ngOnInit() {}

  public async openMenu() {
    await this._menuCtrl.toggle('main-menu');
  }

  public async closeModal(){
    await this._modal.closeModal();
  }
}
