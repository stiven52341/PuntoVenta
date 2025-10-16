import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CxcPage } from './cxc.page';

describe('CxcPage', () => {
  let component: CxcPage;
  let fixture: ComponentFixture<CxcPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CxcPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
