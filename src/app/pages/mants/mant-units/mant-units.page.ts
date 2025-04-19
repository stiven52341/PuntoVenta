import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonInput,
  IonButton,
  IonIcon,
  IonTabButton,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { search } from 'ionicons/icons';
import { HeaderBarComponent } from 'src/app/components/header-bar/header-bar.component';
import { IUnit } from 'src/app/models/unit.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { ModalsService } from 'src/app/services/modals/modals.service';

@Component({
  selector: 'app-mant-units',
  templateUrl: './mant-units.page.html',
  styleUrls: ['./mant-units.page.scss'],
  standalone: true,
  imports: [
    IonLabel,
    IonIcon,
    IonButton,
    IonInput,
    IonContent,
    IonHeader,
    HeaderBarComponent,
    ReactiveFormsModule,
  ],
})
export class MantUnitsPage implements OnInit {
  protected unit?: IUnit;
  protected form: FormGroup;

  constructor(private _modal: ModalsService, private _alert: AlertsService) {
    addIcons({ search });

    this.form = new FormGroup({
      name: new FormControl(null, [
        Validators.required,
        Validators.maxLength(50),
      ]),
      short: new FormControl(null, [Validators.maxLength(10)]),
    });
  }

  ngOnInit() {}

  protected async onSearchUnit() {
    this.unit = await this._modal.showUnitsList();
    if (this.unit) this.setForm(this.unit);
  }

  private setForm(unit: IUnit) {
    this.form.get('name')?.setValue(unit.name);
    this.form.get('short')?.setValue(unit.shortcut);
  }

  private checkForm(): boolean{
    if(this.form.get('name')?.invalid){
      this._alert.showError('Nombre inválido');
      return false;
    }

    if(this.form.get('short')?.invalid){
      this._alert.showError('Abreviatura inválida');
      return false;
    }

    return true;
  }

  protected async onSave(){
    if(!this.checkForm()) return;


  }
}
