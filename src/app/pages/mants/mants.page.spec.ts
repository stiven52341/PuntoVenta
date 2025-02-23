import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MantsPage } from './mants.page';

describe('MantsPage', () => {
  let component: MantsPage;
  let fixture: ComponentFixture<MantsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MantsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
