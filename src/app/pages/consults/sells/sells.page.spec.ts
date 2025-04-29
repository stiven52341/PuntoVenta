import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SellsPage } from './sells.page';

describe('SellsPage', () => {
  let component: SellsPage;
  let fixture: ComponentFixture<SellsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SellsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
