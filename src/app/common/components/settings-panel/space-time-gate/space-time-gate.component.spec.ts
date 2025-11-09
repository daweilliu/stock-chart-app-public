import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceTimeGateComponent } from './space-time-gate.component';

describe('SpaceTimeGateComponent', () => {
  let component: SpaceTimeGateComponent;
  let fixture: ComponentFixture<SpaceTimeGateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceTimeGateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceTimeGateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
