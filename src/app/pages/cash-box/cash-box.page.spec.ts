import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashBoxPage } from './cash-box.page';

describe('CashBoxPage', () => {
  let component: CashBoxPage;
  let fixture: ComponentFixture<CashBoxPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CashBoxPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
