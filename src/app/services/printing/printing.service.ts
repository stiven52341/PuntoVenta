import { Injectable } from '@angular/core';
import { PrinterService } from '../local/printer/printer.service';
import { IPurchase } from 'src/app/models/purchase.model';
import { AlertsService } from '../alerts/alerts.service';

@Injectable({
  providedIn: 'root'
})
export class PrintingService {

  constructor(private _localPrint: PrinterService, private _alert: AlertsService) {
  }

  public async printPurchase(purchase: IPurchase){

  }

  
}
