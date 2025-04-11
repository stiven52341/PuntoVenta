import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MantUnitsPage } from './mant-units.page';

describe('MantUnitsPage', () => {
  let component: MantUnitsPage;
  let fixture: ComponentFixture<MantUnitsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MantUnitsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
