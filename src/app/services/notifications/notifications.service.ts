import { Injectable } from '@angular/core';
import {
  LocalNotifications,
} from '@capacitor/local-notifications';
import { PlatformService } from '../platform/platform.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor(private _platform: PlatformService) { }

  /**
   * Init notification service channel
   * @returns `Promise<void>`
   */
  public async init(){
    if(!this._platform.isAndroid()) return;

    const permission = await LocalNotifications.requestPermissions();
    if(permission.display != 'granted') return;

    try {
      await LocalNotifications.createChannel({
        id: 'default',
        name: 'Default',
        importance: 3
      });
    } catch (error) {
      throw error;
    }

    LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('received',notification);
    });

    LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      console.log('action performed',action);
    });
  }

  /**
   * Present notification now
   * @param title `string`
   * @param body `string`
   * @param id `number` By default 1
   */
  public async scheduleImmediate(title: string, body: string, id: number = 1){
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title,
        body,
        smallIcon: 'ic_stat_icon',
      }]
    });
  }

  /**
   * Present notification at a certain time
   * @param title `string`
   * @param body `string`
   * @param date `Date`
   * @param id `number` By default 1
   */
  public async scheduleAt(title: string, body: string, date: Date, id: number = 1){
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title,
        body,
        schedule: {at: date}
      }]
    });
  }

  public async cancel(id: number){
    await LocalNotifications.cancel({notifications: [{id}]});
  }

  public async getAll(){
    return await LocalNotifications.getDeliveredNotifications();
  }
}
