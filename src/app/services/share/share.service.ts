import { Injectable } from '@angular/core';
import { Share } from '@capacitor/share';

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor() { }

  public async shareData(title: string, data: string, type: 'text' | 'uri') {
    if (!(await Share.canShare()).value) {
      throw new Error("Cannot share");
    }

    switch (type) {
      case 'text':
        await Share.share({
          title: title,
          text: data
        });
        break;
      case 'uri':
        await Share.share({
          title: title,
          url: data
        });
        break;
    }
  }
}
