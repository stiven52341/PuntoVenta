import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCheckbox, IonContent, IonHeader, IonIcon, IonInput, IonInputPasswordToggle, IonLabel, ViewWillEnter } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logIn } from 'ionicons/icons';
import { HeaderBarComponent } from 'src/app/components/elements/header-bar/header-bar.component';
import { IEmployee } from 'src/app/models/employee.model';
import { AlertsService } from 'src/app/services/alerts/alerts.service';
import { CurrentEmployeeService } from 'src/app/services/local/current-employee/current-employee.service';
import { LocalEmployeeService } from 'src/app/services/local/local-employee/local-employee.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonHeader, HeaderBarComponent, IonCard, IonCardHeader, IonCardContent,
    IonCardTitle, ReactiveFormsModule, IonInput, IonInputPasswordToggle, IonCheckbox,
    IonButton, IonIcon, IonLabel
  ]
})
export class LoginPage implements ViewWillEnter {
  protected form: FormGroup;

  constructor(
    private _user: CurrentEmployeeService,
    private _alert: AlertsService,
    private _employee: LocalEmployeeService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    addIcons({ logIn });

    this.form = new FormGroup({
      user: new FormControl<string>('', [Validators.required, Validators.maxLength(50)]),
      pass: new FormControl<string>('', [Validators.required]),
      remember: new FormControl<boolean>(false, [Validators.required])
    });
  }

  async ionViewWillEnter() {
    const user = await this._user.getCurrentEmployee();
    if (!user) return;

    if (!user.remember) return;
    this.form.get('user')?.setValue(user.username);
    this.form.get('pass')?.setValue(user.password);
    this.form.get('remember')?.setValue(user.remember || false);

    
    const loggedOut = Boolean(this._route.snapshot.queryParams['loggedOut'] || false);
    if (!loggedOut) await this.login();

  }

  private check(): boolean {
    if (this.form.get('user')?.invalid) {
      this._alert.showError('Nombre de usuario inválido');
      return false;
    }

    if (this.form.get('pass')?.invalid) {
      this._alert.showError('Contraseña inválida');
      return false;
    }

    return true;
  }

  protected async login() {
    if (!this.check()) return;

    const username = (this.form.get('user')!.value as string).trim();
    const password = (this.form.get('pass')!.value as string).trim();
    const remember = (this.form.get('remember')?.value || false) as boolean;
    const matchUser = await this._employee.loginEmployee(username, password);

    if (!matchUser) {
      this._alert.showError('Usuario o contraseña incorrectos');
      return;
    }
    matchUser.remember = remember;
    await this._user.setCurrentEmployee(matchUser);
    this._router.navigate(['/home']);
  }
}
