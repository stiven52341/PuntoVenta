import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultsPage } from './consults.page';

describe('ConsultsPage', () => {
  let component: ConsultsPage;
  let fixture: ComponentFixture<ConsultsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
