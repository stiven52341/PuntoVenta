import { Component, Input, OnInit } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonInput,
  IonButton,
  ModalController,
} from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../header-bar/header-bar.component';
import { FormsModule, NgModel } from '@angular/forms';
import { AlertsService } from 'src/app/services/alerts/alerts.service';

@Component({
  selector: 'app-cash-box',
  templateUrl: './cash-box.component.html',
  styleUrls: ['./cash-box.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonInput,
    IonHeader,
    IonContent,
    HeaderBarComponent,
    FormsModule,
  ],
})
export class CashBoxComponent implements OnInit {
  protected title: string = 'Caja';
  protected inputPlaceholder: string = '';
  protected label: string = '';
  protected amount: number = 0;
  protected buttonText: string = '';
  @Input({ required: true }) type!: 'open' | 'close';

  constructor(
    private _modalCtrl: ModalController,
    private _alert: AlertsService
  ) {}

  ngOnInit() {
    switch (this.type) {
      case 'open':
        this.title = 'Abrir Caja';
        this.inputPlaceholder = 'Ingrese la cantidad de apertura';
        this.label = 'Cantidad de Apertura';
        this.buttonText = 'Abrir Caja';
        break;
      case 'close':
        this.title = 'Cerrar Caja';
        this.inputPlaceholder = 'Ingrese la cantidad de cierre';
        this.label = 'Cantidad de Cierre';
        this.buttonText = 'Cerrar Caja';
        break;
    }
  }

  private checkForm(): boolean {
    if (this.amount < 1) {
      this._alert.showError('La cantidad debe ser mayor a 0');
      return false;
    }
    return true;
  }

  protected async onClose() {
    if (!this.checkForm()) return;

    if (
      !(await this._alert.showConfirm(
        'CONFIRME',
        this.type == 'open'
          ? '¿Está seguro de abrir la caja?'
          : '¿Está seguro de cerrar la caja?'
      ))
    )
      return;

    const open = async (amount: number) => {};

    const close = async (amount: number) => {};

    switch (this.type) {
      case 'open':
        await open(this.amount);
        break;
      case 'close':
        await close(this.amount);
        break;
    }
  }
}
