import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private _toastCtrl: ToastController) {}

  public async showToast(
    text: string,
    duration: number = 5000,
    color: 'primary' | 'danger' | 'success' = 'primary',
    position: "top" | "bottom" | "middle" = 'bottom'
  ) {
    const toast = await this._toastCtrl.create({
      message: text,
      duration: duration,
      animated: true,
      color: color,
      position: position,
    });

    await toast.present();
    return toast;
  }
}
