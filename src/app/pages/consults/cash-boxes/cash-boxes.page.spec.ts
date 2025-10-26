import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CashBoxesPage } from './cash-boxes.page';

describe('CashBoxesPage', () => {
  let component: CashBoxesPage;
  let fixture: ComponentFixture<CashBoxesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CashBoxesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
