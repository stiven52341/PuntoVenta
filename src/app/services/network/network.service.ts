import { Injectable } from '@angular/core';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {

  constructor() { }

  public async isInternetAvailable(): Promise<boolean>{
    const result = await Network.getStatus();
    return result.connected;
  }
}
