import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LateBillsPage } from './late-bills.page';

describe('LateBillsPage', () => {
  let component: LateBillsPage;
  let fixture: ComponentFixture<LateBillsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LateBillsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
