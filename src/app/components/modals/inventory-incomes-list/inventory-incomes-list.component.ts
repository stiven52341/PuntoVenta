import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, ModalController } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { IInventoryIncome } from 'src/app/models/inventory-income.model';
import { LocalInventoryIncomeService } from 'src/app/services/local/local-inventory-income/local-inventory-income.service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-inventory-incomes-list',
  templateUrl: './inventory-incomes-list.component.html',
  styleUrls: ['./inventory-incomes-list.component.scss'],
  standalone: true,
  imports: [
    IonHeader, IonContent, HeaderBarComponent, IonList, IonItem, IonLabel, DatePipe, DecimalPipe,
    IonInfiniteScroll, IonInfiniteScrollContent
  ]
})
export class InventoryIncomesListComponent implements OnInit {
  protected incomes: Array<IInventoryIncome> = [];
  protected incomesFiltered: Array<IInventoryIncome> = [];
  protected loading: boolean = false;

  constructor(private _localIncome: LocalInventoryIncomeService, private _modalCtrl: ModalController) { }

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    this.incomes = (await this._localIncome.getAll()).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    });

    this.generateItems();
  }

  private generateItems(offset: number = 30){
    const count = this.incomesFiltered.length;

    for(let i = 0; i < offset; i++){
      if(this.incomes[i + count]){
        this.incomesFiltered.push(this.incomes[i + count]);
      }
    }
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.generateItems();
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  protected onClick(income: IInventoryIncome){
    this._modalCtrl.dismiss(income);
  }
}
