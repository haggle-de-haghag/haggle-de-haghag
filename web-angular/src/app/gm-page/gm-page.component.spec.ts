import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GmPageComponent } from './gm-page.component';

describe('GmPageComponent', () => {
  let component: GmPageComponent;
  let fixture: ComponentFixture<GmPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GmPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GmPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
