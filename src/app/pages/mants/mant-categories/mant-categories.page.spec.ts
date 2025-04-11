import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MantCategoriesPage } from './mant-categories.page';

describe('MantCategoriesPage', () => {
  let component: MantCategoriesPage;
  let fixture: ComponentFixture<MantCategoriesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MantCategoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
