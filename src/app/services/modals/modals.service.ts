import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular/standalone';
import { FirstOpenedComponent } from 'src/app/components/modals/first-opened/first-opened.component';
import { ProductComponent } from 'src/app/components/modals/product/product.component';
import { IProduct } from 'src/app/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ModalsService {
  constructor(private _modalCtrl: ModalController) {}

  public async showModal(
    component: any,
    id?: string,
    data?: any,
    cssClass?: string,
    canDismiss: boolean = true
  ) {
    const modal = await this._modalCtrl.create({
      component: component,
      animated: true,
      componentProps: data,
      cssClass: cssClass,
      canDismiss: canDismiss,
      id: id
    });

    await modal.present();

    return await modal.onWillDismiss();
  }

  public async showFirstOpenedModal(){
    return await this.showModal(FirstOpenedComponent, 'first-time-modal');
  }

  public async showProductModal(product: IProduct, image?: string){
    return await this.showModal(ProductComponent, 'product-modal',{product: product, image: image});
  }

  public async closeModal(id?: string, data?: any){
    this._modalCtrl.dismiss(data, undefined, id);
  }
}
