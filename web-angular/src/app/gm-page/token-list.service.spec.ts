import { TestBed } from '@angular/core/testing';

import { TokenListService } from './token.service';

describe('TokenService', () => {
  let service: TokenListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
