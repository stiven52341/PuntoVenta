import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BillInvoicePage } from './bill-invoice.page';

describe('BillInvoicePage', () => {
  let component: BillInvoicePage;
  let fixture: ComponentFixture<BillInvoicePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BillInvoicePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
