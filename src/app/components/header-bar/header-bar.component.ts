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
import { Router } from '@angular/router';
import { LocalCartService } from 'src/app/services/local/local-cart/local-cart.service';
import { ICart } from 'src/app/models/cart.model';

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

  protected cart?: ICart;

  constructor(private _menuCtrl: MenuController, private _modal: ModalsService, private _router: Router,
    private _cart: LocalCartService
  ) {
    addIcons({arrowBack,menu,cart});
  }

  ngOnInit() {
    this._cart.getCart().subscribe((cart) => {
      this.cart = cart;
    });
  }

  public async openMenu() {
    await this._menuCtrl.toggle('main-menu');
  }

  public async closeModal(){
    await this._modal.closeModal();
  }

  protected async goTo(path: string){
    await this._router.navigate([path]);
  }
}
