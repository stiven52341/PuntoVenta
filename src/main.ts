import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import {provideHttpClient } from '@angular/common/http';
import { Storage } from '@ionic/storage';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({
      rippleEffect: false,
      mode: 'md',
      innerHTMLTemplatesEnabled: true
    }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    Storage,
    ModalController
  ],
});
