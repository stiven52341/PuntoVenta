import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiKeys, States } from 'src/app/models/constants';
import { FilesService } from '../../files/files.service';

export interface Entity {
  id: string | number | Object;
  state: boolean;
  uploaded: States;
}

@Injectable({
  providedIn: 'root',
})
export abstract class ApiCoreService<T extends Entity> {
  protected _http = inject(HttpClient);
  protected _file = inject(FilesService);

  constructor(protected path: ApiKeys) {}

  public async getAll(): Promise<Array<T> | null> {
    const result = await firstValueFrom(
      this._http.get(this.path, { responseType: 'text' })
    ).catch((err) => {
      console.log(`Error while getting all: ${JSON.stringify(err)}`);
      this._file.saveError(err);
    });

    if (!result) return null;

    const data = JSON.parse(result) as Array<T>;
    data.map((value) => (value.uploaded = States.DOWNLOADED));
    return data;
  }

  public async get(id: string | number | Object): Promise<T | null> {
    let result: Object | void | undefined = undefined;
    if (id instanceof Object) {
      id = JSON.stringify(id);

      result = await firstValueFrom(
        this._http.post(`${this.path}/get`, id)
      ).catch((err) => {
        console.log(`Error while getting: ${JSON.stringify(err)}`);
      });
    } else {
      result = await firstValueFrom(
        this._http.get(`${this.path}/get?id=${id}`)
      ).catch((err) => {
        console.log(`Error while getting: ${JSON.stringify(err)}`);
        this._file.saveError(err);
      });
    }

    if (!result) return null;

    const data = result as T;
    data.uploaded = States.DOWNLOADED;
    return data;
  }

  public async getByParam(
    param: string,
    value: string | number | Object
  ): Promise<Array<T> | null> {
    if (value instanceof Object) {
      value = JSON.stringify(value);
    }

    const result = await firstValueFrom(
      this._http.get(`${this.path}/get-by-${param}=${value}`)
    ).catch((err) => {
      console.log(`Error while getting by param: ${JSON.stringify(err)}`);
      this._file.saveError(err);
    });

    if (!result) return null;

    const data = result as Array<T>;
    data.map((val) => (val.uploaded = States.DOWNLOADED));
    return data;
  }

  public async insert(
    object: T
  ): Promise<number | string | Object | undefined> {
    const result = await firstValueFrom(
      this._http.post(`${this.path}/insert`, object)
    ).catch((err) => {
      console.log(`Error while inserting: ${JSON.stringify(err)}`);
      this._file.saveError(err);
    });

    if (!result) return undefined;

    return result;
  }

  public async update(object: T): Promise<boolean> {
    const result = await firstValueFrom(
      this._http.post(`${this.path}/update`, object)
    ).catch((err) => {
      console.log(`Error while updating: ${JSON.stringify(err)}`);
      this._file.saveError(err);
    });

    if (!result) return false;

    return true;
  }

  public async delete(object: T): Promise<boolean> {
    const result = await firstValueFrom(
      this._http.post(`${this.path}/delete`, object)
    ).catch((err) => {
      console.log(`Error while deleting: ${JSON.stringify(err)}`);
      this._file.saveError(err);
    });

    if (!result) return false;

    return true;
  }
}
