import { Injectable } from '@angular/core';
import { AlertButton, AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  private alert?: HTMLIonAlertElement;
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
    let str = '';

    if (image) {
      str = `
        <div class="alert">
          <img *ngIf="image" src="${image}">
          <p>${message}</p>
        </div>
      `;
    } else {
      str = `
        <div class="alert">
          <p>${message}</p>
        </div>
      `;
    }

    this.alert = await this.alertCtrl.create({
      header: title,
      subHeader: subtitle,
      message: str,
      cssClass: 'alert',
      buttons: buttons,
      animated: true,
    });

    await this.alert.present();
    return (await this.alert.onDidDismiss()).data;
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
    const close = async (val: boolean) => {
      this.alert!.dismiss(val);
    };

    return await this.showAlert(title, body, '../../../assets/icon/ask.png', [
      {
        text: 'SÍ',
        handler() {
          close(true);
        },
      },
      {
        text: 'NO',
        handler() {
          close(false);
        },
      },
    ]);
  }

  public async showOptions(
    title: string,
    info: string,
    options: Array<{ label: string; do: () => void | Promise<void> }>
  ) {
    const buttons: Array<AlertButton> = [];
    options.forEach((option) => {
      buttons.push({
        text: option.label.toUpperCase(),
        async handler() {
          await option.do();
        },
      });
    });

    return await this.showAlert(title, info, undefined, buttons);
  }
}
