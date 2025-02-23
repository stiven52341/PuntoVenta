import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { ICategory } from 'src/app/models/category.model';

@Component({
  selector: 'app-category-card',
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss'],
  standalone: true,
  imports: [NgIf, IonIcon]
})
export class CategoryCardComponent  implements OnInit {
  @Input({required: true}) category!: ICategory;
  @Input() image?: string;
  @Input() icon?: string;

  constructor() { }

  ngOnInit() {}

}
