import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonButton, IonIcon, IonItem, IonLabel, IonList } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { IButton } from 'src/app/models/button.model';

@Component({
  selector: 'app-button-list',
  templateUrl: './button-list.component.html',
  styleUrls: ['./button-list.component.scss'],
  standalone: true,
  imports: [IonList, IonItem, IonButton,IonIcon,IonLabel, NgIf, NgFor, NgClass]
})
export class ButtonListComponent  implements OnInit {
  @Input({required: true}) buttons: Array<IButton> = [];
  @Input() whiteColor: boolean = false;
  @Input() disabled: boolean = false;

  constructor() {
    addIcons({});
  }

  ngOnInit() {}

}
