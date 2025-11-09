import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MantEmployeesPage } from './mant-employees.page';

describe('MantEmployeesPage', () => {
  let component: MantEmployeesPage;
  let fixture: ComponentFixture<MantEmployeesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MantEmployeesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
