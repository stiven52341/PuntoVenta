import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { print } from 'ionicons/icons';
import { ButtonListComponent } from 'src/app/components/button-list/button-list.component';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { IButton } from 'src/app/models/button.model';
import { FilesKeys } from 'src/app/models/constants';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { FilesService } from 'src/app/services/files/files.service';
import { GlobalService } from 'src/app/services/global/global.service';
import { InternalStorageCoreService } from 'src/app/services/local/internal-storage-core/internal-storage-core.service';
import { ShareService } from 'src/app/services/share/share.service';

@Component({
  selector: 'app-config',
  templateUrl: './config.page.html',
  styleUrls: ['./config.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, HeaderBarComponent, ButtonListComponent]
})
export class ConfigPage implements OnInit {
  protected buttons: Array<IButton>;
  protected loading: boolean = false;

  constructor(
    private _router: Router, private _share: ShareService, private _file: FilesService,
    private _alert: AlertsService, private _global: GlobalService
  ) {
    addIcons({ print });

    this.buttons = [
      {
        title: 'Impresora',
        image: '../../assets/icon/printer.png',
        do: () => {
          this._router.navigate(['/config/printer']);
        }
      },
      {
        title: 'Enviar datos almacenados',
        image: '../../assets/icon/send.png',
        do: async () => {
          this.loading = true;
          const allData = await InternalStorageCoreService.getAllSavedData();
          const url = await this._file.saveTempData(FilesKeys.APP_DATA, allData);
          if (!url) {
            this.loading = false;
            return;
          }
          await this._share.shareData('Share Data', url, 'uri').finally(() => {
            this.loading = false;
          });

        }
      },
      {
        title: 'Sincronizar datos con API',
        image: '',
        do: async () => {
          if(
            !await this._alert.showConfirm('Advertencia', `
                Al realizar esta acción, se sobreescribirán los datos ya
                almacenados en la base de datos tanto interna como externa.<br>
                <b color="red">¿Está seguro de proseguir?</b>
              `)
          ) return;

          await this._global.syncDataWithAPI().then(() => {
            this._alert.showSuccess('Datos sincronizados correctamente');
          }).catch(() => {
            this._alert.showSuccess('Ha ocurrido un error sincronizando los datos');
          });
        }
      }
    ];
  }

  ngOnInit() {
  }

}
