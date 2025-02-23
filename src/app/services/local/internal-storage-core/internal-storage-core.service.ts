import { inject, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { StorageKeys } from 'src/app/models/constants';
import { Entity } from '../../api/api-core/api-core.service';

@Injectable({
  providedIn: 'root'
})
export class InternalStorageCoreService<T extends Entity> {
  private storage: Storage | undefined;
  private _storage = inject(Storage);

  constructor(private key: StorageKeys) {
    this._storage.create().then((v => this.storage = v));
  }

  public async getAll(): Promise<Array<T>>{
    return await this.storage?.get(this.key) as Array<T> || [];
  }

  public async insert(obj: T){
    const valores = await this.getAll();
    valores.push(obj);
    await this.storage?.set(this.key, valores);
  }

  public async get(id: string | number){
    return (await this.getAll()).find(
      (valor: T) => {
        return valor.id == id;
      }
    );
  }

  public async update(obj: T){
    const valores = await this.getAll();
    const index = valores.findIndex(valor => valor.id == obj.id);
    if(index == -1) throw new Error("Not found");
    valores[index] = obj;

    await this._storage.set(this.key, valores);
  }

  public async delete(obj: T){
    const valores = await this.getAll();
    const index = valores.findIndex(valor => valor.id == obj.id);
    if(index == -1) throw new Error("Not found");
    valores.splice(index,1);
    await this._storage.set(this.key, valores);
  }
}
