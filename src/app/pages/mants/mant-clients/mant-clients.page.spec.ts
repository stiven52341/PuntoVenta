import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MantClientsPage } from './mant-clients.page';

describe('MantClientsPage', () => {
  let component: MantClientsPage;
  let fixture: ComponentFixture<MantClientsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MantClientsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
