import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MantPricesPage } from './mant-prices.page';

describe('MantPricesPage', () => {
  let component: MantPricesPage;
  let fixture: ComponentFixture<MantPricesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MantPricesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
