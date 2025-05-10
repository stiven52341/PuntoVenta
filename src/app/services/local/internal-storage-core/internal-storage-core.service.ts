import { inject, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { StorageKeys } from 'src/app/models/constants';
import { Entity } from '../../api/api-core/api-core.service';

@Injectable({
  providedIn: 'root'
})
export abstract class InternalStorageCoreService<T extends Entity> {
  protected _storage = inject(Storage);

  constructor(protected key: StorageKeys) {
    this.initStorage();
  }

  public async initStorage(){
    await this._storage.create();
  }

  public async getAll(): Promise<Array<T>>{
    return await this._storage.get(this.key) as Array<T> || [];
  }

  public async insert(obj: T){
    const valores = await this.getAll();
    valores.push(obj);
    await this._storage.set(this.key, valores);
  }

  public async get(id: string | number | Object){
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

  public async set(objs: Array<T>){
    await this._storage.set(this.key, JSON.parse(JSON.stringify(objs)));
  }

  public async getNextID(): Promise<number>{
    const values = (await this.getAll() || []).sort((a,b) => {
      return Number(b.id) - Number(a.id);
    });

    if(values.length == 0) return 1;
    return Number(values[0].id) + 1;
  }

  public async deactivate(obj: T){
    obj.state = false;
    await this.update(obj);
  }
}
