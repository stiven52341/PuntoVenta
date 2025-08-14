import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import { ApiKeys, States } from 'src/app/models/constants';
import { FilesService } from '../../files/files.service';
import { ErrorsService } from '../errors/errors.service';

export interface IEntity<T> {
  id: T;
  state: boolean;
  uploaded: States;
}

@Injectable({
  providedIn: 'root',
})
export abstract class ApiCoreService<T extends IEntity<U>, U = T extends IEntity<infer X> ? X : never> {
  protected readonly _http = inject(HttpClient);
  protected readonly _file = inject(FilesService);
  protected readonly _errors = inject(ErrorsService);
  protected readonly timeout = 10000;

  constructor(protected path: ApiKeys) {
  }

  public async getAll(): Promise<Array<T> | undefined> {
    const result = await firstValueFrom(
      this._http.get(this.path, { responseType: 'json' })
    ).catch((err) => {
      console.log(`Error while getting all: ${JSON.stringify(err)}`);
      this._file.saveError(err);
      this._errors.saveErrors(err);
      throw new Error(err);
    });

    if (!result) return undefined;

    const data = result as Array<T>;
    data.map((value) => (value.uploaded = States.DOWNLOADED));
    return data;
  }

  public async get(id: U): Promise<T | undefined> {
    let result: T | undefined = undefined;
    if (id instanceof Object) {
      result = await firstValueFrom(
        this._http.post(`${this.path}/get`, id)
      ).catch((err) => {
        console.log(`Error while getting: ${JSON.stringify(err)}`);
        this._file.saveError(err);
        this._errors.saveErrors(err);
        throw new Error(err);
      }) as T;
    } else {
      result = await firstValueFrom(
        this._http.get(`${this.path}/get?id=${id}`)
      ).catch((err) => {
        console.log(`Error while getting: ${JSON.stringify(err)}`);
        this._file.saveError(err);
        this._errors.saveErrors(err);
        throw new Error(err);
      }) as T;
    }

    if (!result) return undefined;

    const data = result as T;
    data.uploaded = States.DOWNLOADED;
    return data;
  }

  public async getByParam(
    param: string,
    value: string | number | Object
  ): Promise<Array<T> | undefined> {
    if (value instanceof Object) {
      value = JSON.stringify(value);
    }

    const result = await firstValueFrom(
      this._http.get(`${this.path}/get-by-${param}=${value}`)
    ).catch((err) => {
      console.log(`Error while getting by param: ${JSON.stringify(err)}`);
      this._file.saveError(err);
      this._errors.saveErrors(err);
      throw new Error(err);
    });

    if (!result) return undefined;

    const data = result as Array<T>;
    data.map((val) => (val.uploaded = States.DOWNLOADED));
    return data;
  }

  public async insert(
    object: T
  ): Promise<U | undefined> {
    const result = await firstValueFrom(
      this._http.post(`${this.path}/insert`, object).pipe(timeout(this.timeout))
    ).catch((err) => {
      console.log(`Error while inserting: ${JSON.stringify(err)}`);
      this._file.saveError(err);
      this._errors.saveErrors(err);
      return undefined;
    });

    if (!result) return undefined;

    return result as U;
  }

  public async update(object: T): Promise<boolean> {
    const result = await firstValueFrom(
      this._http.post(`${this.path}/update`, object).pipe(timeout(this.timeout))
    ).catch((err) => {
      console.log(`Error while updating: ${JSON.stringify(err)}`);
      this._file.saveError(err);
      this._errors.saveErrors(err);
      return false;
    });

    if (!result) return false;

    return true;
  }

  public async delete(object: T): Promise<boolean> {
    const result = await firstValueFrom(
      this._http.post(`${this.path}/delete`, object).pipe(timeout(this.timeout))
    ).catch((err) => {
      console.log(`Error while deleting: ${JSON.stringify(err)}`);
      this._file.saveError(err);
      this._errors.saveErrors(err);
      throw new Error(err);
    });

    if (!result) return false;

    return true;
  }
}
