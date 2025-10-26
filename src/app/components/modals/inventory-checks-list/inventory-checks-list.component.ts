import { Component, OnDestroy, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, IonButton, IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonInput, IonItem, IonLabel, IonList, ModalController } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IInventoryCheck } from 'src/app/models/inventory-check.model';
import { LocalInventoryCheckService } from 'src/app/services/local/local-inventory-check/local-inventory-check.service';
import { debounceTime, firstValueFrom, forkJoin, Subscription } from 'rxjs';
import { LocalInventoryCheckDetailsService } from 'src/app/services/local/local-inventory-check-details/local-inventory-check-details.service';

@Component({
  selector: 'app-inventory-checks-list',
  templateUrl: './inventory-checks-list.component.html',
  styleUrls: ['./inventory-checks-list.component.scss'],
  standalone: true,
  imports: [
    IonHeader, IonContent, HeaderBarComponent, IonInput, ReactiveFormsModule, IonList, IonItem, IonLabel,
    IonInfiniteScroll, IonInfiniteScrollContent, DatePipe
  ],
})
export class InventoryChecksListComponent implements OnInit, OnDestroy {
  protected searchForm: FormGroup;
  private checks: Array<IInventoryCheck> = [];
  protected checksFiltered: Array<IInventoryCheck> = [];
  protected loading: boolean = false;
  private subs: Array<Subscription> = [];
  protected isPrinter: boolean = false;

  constructor(
    private _datePipe: DatePipe, private _checks: LocalInventoryCheckService, private _modalCtrl: ModalController,
    private _details: LocalInventoryCheckDetailsService
  ) {

    const actualDateStr = this._datePipe.transform(new Date(), 'yyyy-MM-dd')!;
    this.searchForm = new FormGroup({
      from: new FormControl<string>(actualDateStr),
      to: new FormControl<string>(actualDateStr)
    });
  }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;

    const sub = this.searchForm.valueChanges.pipe(debounceTime(300)).subscribe({
      next: () => {
        this.onSearch();
      }
    });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.map(sub => sub.unsubscribe());
  }

  private async init() {

    this.checks = await this._checks.getAll();

    const promises = this.checks.map(async check => {
      check.details = await this._details.getByInventory(check.id as number);
    });

    await firstValueFrom(forkJoin(promises));

    this.generateItems(this.checks);
  }

  private generateItems(list: Array<IInventoryCheck>, limit: number = 30) {
    const count = this.checksFiltered.length;
    for (let i = 0; i < limit; i++) {
      if (list[count + i]) {
        this.checksFiltered.push(list[count + i]);
      }
    }
  }

  onIonInfinite($event: InfiniteScrollCustomEvent) {
    this.generateItems(this.checks);
    setTimeout(() => {
      $event.target.complete();
    }, 500);
  }

  private onSearch() {
    this.checksFiltered = [];

    const from = (this.searchForm.get('from')?.value || '') as string;
    const to = (this.searchForm.get('to')?.value || '') as string;

    let fromDate = new Date(from);
    fromDate.setHours(0, 0, 0);

    let toDate = new Date(to);
    toDate.setHours(0, 0, 0);

    if(fromDate.getTime() > toDate.getTime()){
      const temp = fromDate;
      fromDate = toDate;
      toDate = temp;
    }

    const newList = this.checks.filter(check => {
      const date = new Date(check.date);
      date.setHours(0, 0, 0);
      return date.getTime() >= fromDate.getTime() && date.getTime() <= toDate.getTime();
    });

    this.generateItems(newList);
  }

  protected onClick(check: IInventoryCheck){
    this._modalCtrl.dismiss(check);
  }
}
