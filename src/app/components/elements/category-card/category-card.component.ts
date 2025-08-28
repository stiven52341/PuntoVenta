import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { Observable, Subscription } from 'rxjs';
import { ICategory } from 'src/app/models/category.model';

@Component({
  selector: 'app-category-card',
  templateUrl: './category-card.component.html',
  styleUrls: ['./category-card.component.scss'],
  standalone: true,
  imports: [NgIf, IonIcon],
})
export class CategoryCardComponent implements OnInit, OnDestroy {
  @Input({ required: true }) category!: ICategory;
  @Input() image?: string;
  @Input() icon?: string;
  @Input() selectedCategory?: Observable<ICategory>;

  protected selected: boolean = false;

  private sub?: Subscription;

  constructor() {}

  ngOnInit() {
    this.sub = this.selectedCategory?.subscribe((category) => {
      if(this.selected && +category.id == +this.category.id){
        this.selected = false;
        return;
      }
      this.selected = +category.id == +this.category.id;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
