import { Component, OnDestroy, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, IonCard, IonCardContent, IonContent, IonHeader, IonImg, IonInfiniteScroll, IonInfiniteScrollContent, IonInput, IonItem, IonLabel, IonList, ModalController } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { LocalCashBoxService } from 'src/app/services/local/local-cash-box/local-cash-box.service';
import { ICashBox } from 'src/app/models/cash-box.model';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subscription } from 'rxjs';

@Component({
  selector: 'app-cash-boxes-list',
  templateUrl: './cash-boxes-list.component.html',
  styleUrls: ['./cash-boxes-list.component.scss'],
  standalone: true,
  imports: [
    IonHeader,
    IonContent,
    HeaderBarComponent,
    IonCard,
    IonCardContent,
    IonList,
    IonItem,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonImg,
    IonLabel,
    DatePipe,
    DecimalPipe,
    IonInput,
    ReactiveFormsModule
  ]
})
export class CashBoxesListComponent implements OnInit, OnDestroy {
  protected loading: boolean = false;
  private cashboxes: Array<ICashBox> = [];
  protected cashboxesFiltered: Array<ICashBox> = [];
  protected form: FormGroup;
  private subs: Array<Subscription> = [];

  constructor(private _cashbox: LocalCashBoxService, private _date: DatePipe, private _modalCtrl: ModalController) {
    this.form = new FormGroup({
      init: new FormControl<string>(this._date.transform(new Date(), 'yyyy-MM-dd')!),
      end: new FormControl<string>(this._date.transform(new Date(), 'yyyy-MM-dd')!)
    });
  }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;

    const sub = this.form.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.onSearch();
    });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.map(sub => sub.unsubscribe());
  }

  private async init() {
    this.cashboxes = (await this._cashbox.getAll()).sort((a, b) => {
      const dateInit1 = new Date(a.init);
      const dateInit2 = new Date(b.init);
      const dateEnd1 = new Date(a.init);
      const dateEnd2 = new Date(b.init);
      return (dateInit2.getTime() + dateEnd2.getTime()) - (dateInit1.getTime() + dateEnd1.getTime());
    });
    this.generateItems(this.cashboxes);
  }

  private onSearch() {
    const date1 = this.form.get('init')?.value as string | undefined;
    const date2 = this.form.get('end')?.value as string | undefined;

    if (!date1 && !date2) {
      this.cashboxesFiltered = [];
      this.generateItems(this.cashboxes);
      return;
    }

    if (date1 && !date2) {
      const newList = this.cashboxes.filter(cashbox => {
        const dateSeach = new Date(this._date.transform(date1, 'yyyy-MM-ddThh:mm')!);
        const dateCash1 = new Date(this._date.transform(cashbox.init, 'yyyy-MM-ddThh:mm')!);

        return dateCash1.getTime() >= dateSeach.getTime();
      });
      this.cashboxesFiltered = [];
      this.generateItems(newList);
    } else if (!date1 && date2) {
      const newList = this.cashboxes.filter(cashbox => {
        if(!cashbox?.end) return undefined;
        const dateSearch = new Date(this._date.transform(date2, 'yyyy-MM-ddThh:mm')!);
        dateSearch.setHours(0,0,0);

        const dateCash2 = new Date(this._date.transform(cashbox.end, 'yyyy-MM-ddThh:mm')!);
        dateCash2.setHours(0,0,0);

        return dateCash2.getTime() <= dateSearch.getTime();
      });
      this.cashboxesFiltered = [];
      this.generateItems(newList);
    }else{
      let newDate1 = new Date(this._date.transform(date1!, 'yyyy-MM-ddThh:mm')!);
      newDate1.setHours(0,0,0);

      let newDate2 = new Date(this._date.transform(date2!, 'yyyy-MM-ddThh:mm')!);
      newDate2.setHours(0,0,0);

      if(newDate1.getTime() > newDate2.getTime()){
        const temp = newDate1;
        newDate1 = newDate2;
        newDate2 = temp;
      }

      const newList = this.cashboxes.filter(cashbox => {
        const dateCash1 = new Date(this._date.transform(cashbox.init!, 'yyyy-MM-ddThh:mm')!);
        const dateCash2 = new Date(this._date.transform(cashbox.end!, 'yyyy-MM-ddThh:mm')!);

        return dateCash1.getTime() >= newDate1.getTime() && dateCash2.getTime() <= newDate2.getTime();
      });
      this.cashboxesFiltered = [];
      this.generateItems(newList);
    }
  }

  private generateItems(list: Array<ICashBox>, limit: number = 30) {
    const count = this.cashboxesFiltered.length;

    for (let i = 0; i < limit; i++) {
      if (!list[i + count]) continue;
      this.cashboxesFiltered.push(list[i + count]);
    }
  }

  onIonInfinite($event: InfiniteScrollCustomEvent) {
    this.generateItems(this.cashboxes);
    setTimeout(() => {
      $event.target.complete();
    }, 500);
  }

  protected onClick(cashbox: ICashBox){
    this._modalCtrl.dismiss(cashbox);
  }
}
