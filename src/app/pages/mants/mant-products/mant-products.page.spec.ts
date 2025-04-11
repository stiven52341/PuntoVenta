import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MantProductsPage } from './mant-products.page';

describe('MantProductsPage', () => {
  let component: MantProductsPage;
  let fixture: ComponentFixture<MantProductsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MantProductsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
