import { Component, OnInit } from '@angular/core';
import { InfiniteScrollCustomEvent, IonContent, IonHeader, IonInfiniteScroll, IonInfiniteScrollContent, IonItem, IonLabel, IonList, IonSearchbar, IonToolbar, ModalController } from '@ionic/angular/standalone';
import { HeaderBarComponent } from '../../elements/header-bar/header-bar.component';
import { LocalEmployeeService } from 'src/app/services/local/local-employee/local-employee.service';
import { IEmployee } from 'src/app/models/employee.model';
import { IUserType } from 'src/app/models/user-type.modal';
import { LocalUserTypeService } from 'src/app/services/local/local-user-type/local-user-type.service';

@Component({
  selector: 'app-employees-list',
  templateUrl: './employees-list.component.html',
  styleUrls: ['./employees-list.component.scss'],
  standalone: true,
  imports: [
    IonHeader, IonContent, HeaderBarComponent, IonList, IonItem, IonLabel,
    IonInfiniteScroll, IonInfiniteScrollContent, IonToolbar, IonSearchbar
  ]
})
export class EmployeesListComponent implements OnInit {
  protected loading: boolean = false;
  protected employees: Array<IEmployee> = [];
  protected employeesFiltered: Array<{employee: IEmployee; userType: IUserType}> = [];

  constructor(
    private readonly _modalCtrl: ModalController,
    private readonly _employees: LocalEmployeeService,
    private readonly _userType: LocalUserTypeService
  ) { }

  async ngOnInit() {
    this.loading = true;
    await this.init();
    this.loading = false;
  }

  private async init(){
    this.employees = await this._employees.getAll();
    await this.generateItems(this.employees);
  }

  private async generateItems(list: Array<IEmployee>, limit: number = 30){
    const count = this.employeesFiltered.length;

    for(let i = 0; i < limit; i++){
      const item = list[i + count];
      if(!item) continue;

      const type = await this._userType.get(item.idUserType);
      this.employeesFiltered.push({
        employee: item,
        userType: type!
      });
    }
  }

  protected async search($event: CustomEvent){
    const text = ($event.detail.value as string).trim().toLowerCase();

    const newList = this.employees.filter(emp => {
      return (
        emp.id.toString().includes(text) ||
        emp.name.trim().toLowerCase().includes(text)
      );
    });
    this.employeesFiltered = [];
    await this.generateItems(newList);
  }

  async onIonInfinite($event: InfiniteScrollCustomEvent) {
    this.generateItems(this.employees);
    setTimeout(() => {
      $event.target.complete();
    }, 500);
  }

  protected onClick(employee: IEmployee){
    this._modalCtrl.dismiss(employee);
  }
}
