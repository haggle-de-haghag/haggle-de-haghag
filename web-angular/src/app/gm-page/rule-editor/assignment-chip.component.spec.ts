import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentChipComponent } from './assignment-chip.component';

describe('AssignmentChipComponent', () => {
  let component: AssignmentChipComponent;
  let fixture: ComponentFixture<AssignmentChipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentChipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentChipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
