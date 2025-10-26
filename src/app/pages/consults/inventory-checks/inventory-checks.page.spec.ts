import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryChecksPage } from './inventory-checks.page';

describe('InventoryChecksPage', () => {
  let component: InventoryChecksPage;
  let fixture: ComponentFixture<InventoryChecksPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryChecksPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
