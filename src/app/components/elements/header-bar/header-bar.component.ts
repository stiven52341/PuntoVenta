import {
  IonToolbar,
  IonButtons,
  IonTitle,
  MenuController,
  IonButton,
  IonIcon,
  IonProgressBar,
  IonTabButton, IonLabel } from '@ionic/angular/standalone';
import { Component, Input, OnInit } from '@angular/core';
import { NgIf, UpperCasePipe } from '@angular/common';
import { addIcons } from 'ionicons';
import { cart, menu, arrowBack } from 'ionicons/icons';
import { ModalsService } from 'src/app/services/modals/modals.service';
import { Router } from '@angular/router';
import { LocalCartService } from 'src/app/services/local/local-cart/local-cart.service';
import { ICart } from 'src/app/models/cart.model';
import { Location } from '@angular/common';
import { IButton } from 'src/app/models/button.model';

@Component({
  selector: 'app-header-bar',
  templateUrl: './header-bar.component.html',
  styleUrls: ['./header-bar.component.scss'],
  standalone: true,
  imports: [IonLabel,
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
  @Input() isModal: boolean = true;
  @Input() buttons: Array<IButton> = [];
  @Input() showMenu: boolean = true;

  protected cart?: ICart;

  constructor(private _menuCtrl: MenuController, private _modal: ModalsService, private _router: Router,
    private _cart: LocalCartService, private _location: Location
  ) {
    addIcons({arrowBack,menu,cart});
  }

  async ngOnInit() {
    this.cart = await this._cart.setCart();
    this._cart.getCart().subscribe((cart) => {
      console.log(cart);
      this.cart = cart;
    });
  }

  public async openMenu() {
    await this._menuCtrl.toggle('main-menu');
  }

  public async close(){
    if(this.isModal){
      await this._modal.closeModal();
    }else{
      this._location.back();
    }
  }

  protected async goTo(path: string){
    await this._modal.closeAllModals();
    await this._router.navigate([path]);
  }
}
