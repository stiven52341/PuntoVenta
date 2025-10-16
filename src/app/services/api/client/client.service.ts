import { Injectable } from '@angular/core';
import { ApiCoreService } from '../api-core/api-core.service';
import { IClient } from 'src/app/models/client.model';
import { ApiKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class ClientService extends ApiCoreService<IClient>{

  constructor() {
    super(ApiKeys.CLIENTS);
  }
}
