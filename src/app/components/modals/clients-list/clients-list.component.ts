import { Component, Input, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonSearchbar, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { IClient } from 'src/app/models/client.model';
import { LocalClientService } from 'src/app/services/local/local-client/local-client.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss'],
  standalone: true,
  imports: [
    IonHeader, IonContent, HeaderBarComponent, IonToolbar, IonSearchbar,
    IonList, IonItem, IonLabel, IonInfiniteScroll, IonInfiniteScrollContent,
    DecimalPipe
  ]
})
export class ClientsListComponent implements OnInit {
  private clients: Array<IClient> = [];
  protected clientsFiltered: Array<IClient> = [];
  protected loading: boolean = false;
  protected title: string = "Lista de clientes";
  @Input() showWithBalance: boolean = false;
  @Input() showPositiveBalance: boolean = false;

  constructor(private _client: LocalClientService, private _modalCtrl: ModalController) { }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init() {
    this.title = "Clientes con facturas pendientes";
    this.clients = await this._client.getAll();

    this.generateItems(this.clients);
  }

  private generateItems(list: Array<IClient>, limit: number = 15) {
    const count = this.clientsFiltered.length;

    for (let i = 0; i < limit; i++) {
      if (this.clients[i + count]) {
        this.clientsFiltered.push(this.clients[i + count]);
      }
    }
  }

  protected onSearch($event: CustomEvent) {
    const text: string = (($event.detail.value || '') as string).trim().toLowerCase();
    this.clientsFiltered = [];
    const newClients = this.clients.filter(client => {
      return (
        client.id.toString().includes(text) ||
        client.name.trim().toLowerCase().includes(text) ||
        client.address?.trim().toLowerCase().includes(text)
      );
    });
    this.generateItems(newClients);
  }

  onIonInfinite($event: InfiniteScrollCustomEvent) {
    this.generateItems(this.clients);
    setTimeout(() => {
      $event.target.complete();
    }, 500);
  }

  protected onClick(client: IClient) {
    this._modalCtrl.dismiss(client);
  }
}
