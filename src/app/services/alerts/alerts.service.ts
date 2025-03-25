import { Injectable } from '@angular/core';
import { AlertButton, AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  constructor(private alertCtrl: AlertController) {}

  public async showAlert(
    title: string,
    message: string,
    image?: string,
    buttons: Array<AlertButton> = [
      { text: 'Ok', handler: () => this.alertCtrl.dismiss() },
    ],
    subtitle?: string
  ) {
    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: subtitle,
      message: `
        <div class="alert">
          <img *ngIf="image" src="${image}">
          <p>${message}</p>
        </div>
      `,
      cssClass: 'alert',
      buttons: buttons,
      animated: true,
    });

    await alert.present();
    return (await alert.onDidDismiss()).data;
  }

  public async showError(message: string) {
    await this.showAlert('ERROR', message, '../../../assets/icon/error.png');
  }

  public async showWarning(message: string) {
    await this.showAlert(
      'ADVERTENCIA',
      message,
      '../../../assets/icon/warning.png'
    );
  }

  public async showInfo(message: string) {
    await this.showAlert(
      'INFORMACIÓN',
      message,
      '../../../assets/icon/info.png'
    );
  }

  public async showSuccess(message: string) {
    await this.showAlert('ÉXITO', message, '../../../assets/icon/success.png');
  }

  public async showConfirm(
    title: string = 'CONFIRME',
    body: string
  ): Promise<boolean> {
    return await this.showAlert(title, body, undefined, [
      {
        text: 'SÍ',
        handler() {
        },
      },
      {
        text: 'NO',
        handler(ctrl: AlertController){
          ctrl.dismiss(false);
        }
      }
    ]);
  }
}
