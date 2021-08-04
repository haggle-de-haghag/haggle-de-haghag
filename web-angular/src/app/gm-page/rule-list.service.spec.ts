import { TestBed } from '@angular/core/testing';

import { RuleListService } from './rule-list.service';

describe('RuleListService', () => {
  let service: RuleListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RuleListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
