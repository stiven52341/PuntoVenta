import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiKeys } from 'src/app/services/constants';
import { FilesService } from '../../files/files.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorsService {

  constructor(private _http: HttpClient, private _file: FilesService) { }

  public async saveErrors(error: Error | string){
    const result = await firstValueFrom(
      this._http.post(`${ApiKeys.ERRORS}/insert`, error)
    ).catch((err) => {
      console.log(`Error while saving error: ${JSON.stringify(err)}`);
      this._file.saveError(err);
      throw new Error(err);
    });

    if (!result) return false;

    return true;
  }
}
