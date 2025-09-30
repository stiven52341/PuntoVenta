import { Injectable } from '@angular/core';
import { WebsocketBaseService } from '../websocket-base/websocket-base.service';
import { IOrder } from 'src/app/models/order.model';
import { WebsocketKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class OrdersWsService extends WebsocketBaseService<IOrder>{

  constructor() {
    super(WebsocketKeys.ORDERS);
  }
}
