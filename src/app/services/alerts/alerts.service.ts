import { Injectable } from '@angular/core';
import { AlertButton, AlertController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class AlertsService {
  private alert?: HTMLIonAlertElement;
  constructor(private alertCtrl: AlertController) {}

  private async showAlert(
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
    await this.showAlert('ERROR', message, IMAGES.ERROR);
  }

  public async showWarning(message: string) {
    await this.showAlert(
      'ADVERTENCIA',
      message,
      IMAGES.WARNING
    );
  }

  public async showInfo(message: string) {
    await this.showAlert(
      'INFORMACIÓN',
      message,
      IMAGES.WARNING
    );
  }

  public async showSuccess(message: string) {
    await this.showAlert('ÉXITO', message, IMAGES.SUCCESS);
  }

  public async showConfirm(
    title: string = 'CONFIRME',
    body: string,
    image: 'ask' | 'warning' = 'ask'
  ): Promise<boolean> {
    const close = async (val: boolean) => {
      this.alert!.dismiss(val);
    };

    let imageChosen = '';
    switch(image){
      case 'ask':
        imageChosen = IMAGES.ASK;
        break;
      case 'warning':
        imageChosen = IMAGES.WARNING;
        break;
      default:
        imageChosen = IMAGES.ASK;
        break;
    }

    return await this.showAlert(title, body, imageChosen, [
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

enum IMAGES {
  ERROR = '../../../assets/icon/error.png',
  WARNING = '../../../assets/icon/warning.png',
  INFO = '../../../assets/icon/info.png',
  SUCCESS = '../../../assets/icon/success.png',
  ASK = '../../../assets/icon/ask.png'
}