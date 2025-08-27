import { inject, Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { StorageKeys } from 'src/app/models/constants';
import { IEntity } from '../../api/api-core/api-core.service';
import { FilesService } from '../../files/files.service';

@Injectable({
  providedIn: 'root',
})
export abstract class InternalStorageCoreService<
  T extends IEntity<U>,
  U = T extends IEntity<infer X> ? X : never
> {
  protected static _storage: Storage;
  protected _file = inject(FilesService);

  constructor(protected key: StorageKeys) {
    InternalStorageCoreService._storage = inject(Storage);
    this.initStorage();
  }

  public async initStorage() {

    await InternalStorageCoreService._storage.create();
  }

  public async getAll(): Promise<Array<T>> {
    return ((await InternalStorageCoreService._storage.get(this.key)) as Array<T>) || [];
  }

  public async insert(obj: T) {
    const valores = await this.getAll();
    valores.push(obj);
    await InternalStorageCoreService._storage.set(this.key, valores);
  }

  public async get(id: U) {
    return (await this.getAll()).find((valor: T) => {
      if (valor.id instanceof Object) {
        const keys = Object.keys(valor.id);
        let result = true;
        keys.forEach((key) => {
          result = result && (valor.id as any)[key] == (id as any)[key];
        });
        return result;
      }

      return valor.id == id;
    });
  }

  public async update(obj: T) {
    const valores = await this.getAll();
    const index = valores.findIndex((valor) => {
      if (valor.id instanceof Object) {
        const keys = Object.keys(valor.id);
        let result = true;
        keys.forEach((key) => {
          result = result && (valor.id as any)[key] == (obj.id as any)[key];
        });
        return result;
      }

      return valor.id == obj.id;
    });
    if (index == -1) throw new Error('Not found');
    valores[index] = obj;

    await InternalStorageCoreService._storage.set(this.key, valores);
  }

  public async delete(obj: T) {
    const valores = await this.getAll();
    const index = valores.findIndex((valor) => {
      if (valor.id instanceof Object) {
        const keys = Object.keys(valor.id);
        let result = true;
        keys.forEach((key) => {
          result = result && (valor.id as any)[key] == (obj.id as any)[key];
        });
        return result;
      }

      return valor.id == obj.id;
    });
    if (index == -1) throw new Error('Not found');
    valores.splice(index, 1);
    await InternalStorageCoreService._storage.set(this.key, valores);
  }

  public async set(objs: Array<T>) {
    await InternalStorageCoreService._storage.set(this.key, JSON.parse(JSON.stringify(objs)));
  }

  public async getNextID(): Promise<number> {
    const values = ((await this.getAll()) || []).sort((a, b) => {
      return Number(b.id) - Number(a.id);
    });

    if (values.length == 0) return 1;
    return Number(values[0].id) + 1;
  }

  public async deactivate(obj: T) {
    obj.state = false;
    await this.update(obj);
  }

  public static async getAllSavedData(): Promise<string>{
    const all: Record<string, any> = {};
    // storage.forEach returns a Promise<void>
    await InternalStorageCoreService._storage.forEach((value, key) => {
      all[key] = value;
    });
    return JSON.stringify(all);
  }
}
