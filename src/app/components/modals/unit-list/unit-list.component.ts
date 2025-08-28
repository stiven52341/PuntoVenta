import { Component, OnInit } from '@angular/core';
import { IonContent, IonHeader, IonSearchbar, IonList, IonItem, IonInfiniteScroll, IonInfiniteScrollContent, InfiniteScrollCustomEvent, ModalController, IonLabel } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { IUnit } from 'src/app/models/unit.model';
import { LocalUnitsService } from 'src/app/services/local/local-units/local-units.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-unit-list',
  templateUrl: './unit-list.component.html',
  styleUrls: ['./unit-list.component.scss'],
  standalone: true,
  imports: [
    IonItem,
    IonList,
    IonSearchbar,
    IonHeader,
    IonContent,
    HeaderBarComponent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    NgClass,
    IonLabel
],
})
export class UnitListComponent implements OnInit {
  protected loading: boolean = false;
  private units: Array<IUnit> = [];
  protected filteredUnits: Array<IUnit> = [];

  constructor(private _unit: LocalUnitsService, private _modal: ModalController) {}

  async ngOnInit() {
    this.loading = true;
    await this.onInit();
    this.loading = false;
  }

  private async onInit() {
    this.units = (await this._unit.getAll()).sort((a,b) => +a.id - +b.id);
    this.generateItems(this.units);
  }

  private generateItems(units: Array<IUnit>, limit: number = 25) {
    const count = this.filteredUnits.length;

    for (let i = 0; i < limit; i++) {
      if (units[count + i]) {
        this.filteredUnits.push(units[count + i]);
      }
    }
  }

  onIonInfinite(event: InfiniteScrollCustomEvent) {
    this.generateItems(this.units);
    setTimeout(() => {
      event.target.complete();
    }, 500);
  }

  protected search($event: CustomEvent){
    const value = $event.detail.value as string;

    const newList = this.units.filter(unit => {
      return (
        unit.id.toString().includes(value.toLowerCase().trim()) ||
        unit.name.toLowerCase().trim().includes(value.toLowerCase().trim()) ||
        unit.shortcut?.toLowerCase().trim().includes(value.toLowerCase().trim())
      );
    });

    this.filteredUnits = [];
    this.generateItems(newList);
  }

  protected async onClick(unit: IUnit){
    await this._modal.dismiss(unit);
  }
}
