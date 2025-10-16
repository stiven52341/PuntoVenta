import { TestBed } from '@angular/core/testing';

import { LocalClientService } from './local-client.service';

describe('LocalClientService', () => {
  let service: LocalClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalClientService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
