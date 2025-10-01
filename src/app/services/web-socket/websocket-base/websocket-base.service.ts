import { Injectable } from '@angular/core';
import { IEntity } from '../../api/api-core/api-core.service';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { Subject } from 'rxjs';
import SockJS from 'sockjs-client';
import { WebsocketKeys } from '../../constants';

@Injectable({
  providedIn: 'root'
})
export class WebsocketBaseService<T extends IEntity<ID>, ID = T extends IEntity<infer X> ? X : never> {
  private client!: Client;
  private subscription?: StompSubscription;
  private messages = new Subject<T>();
  private connectionState = new Subject<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>();
  private readonly reconectDelay: number = 5000;
  private readonly heartbeatOutgoing: number = 20000;

  constructor(private path: WebsocketKeys) { }

  public connect() {
    if (this.client && this.client.active) {
      return this.messages.asObservable();
    }

    // Create STOMP client that uses SockJS
    this.client = new Client({
      // create SockJS + STOMP together
      webSocketFactory: () => new SockJS(WebsocketKeys.BASE) as any,
      reconnectDelay: this.reconectDelay,          // auto reconnect
      heartbeatIncoming: 0,
      heartbeatOutgoing: this.heartbeatOutgoing,
      debug: (str) => console.log('[STOMP]', str)
    });

    this.client.onConnect = (frame) => {
      console.log('STOMP connected', frame);
      this.connectionState.next('CONNECTED');

      this.subscription = this.client.subscribe(this.path, (message: IMessage) => {
        try {
          const body = JSON.parse(message.body);
          this.messages.next(body as T);
        } catch (e) {
          this.messages.error(e);
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.onWebSocketClose = () => {
      console.log('WebSocket closed');
      this.connectionState.next('DISCONNECTED');
    };

    this.client.activate();
    this.connectionState.next('CONNECTING');
    return this.messages.asObservable();
  }

  disconnect() {
    this.subscription?.unsubscribe();
    this.client?.deactivate();
    this.messages.complete();
    this.connectionState.next('DISCONNECTED');
    this.connectionState.complete();
  }

  public getConnectionState() {
    return this.connectionState.asObservable();
  }
}