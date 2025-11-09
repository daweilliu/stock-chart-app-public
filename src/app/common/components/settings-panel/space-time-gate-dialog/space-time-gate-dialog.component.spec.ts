import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpaceTimeGateDialogComponent } from './space-time-gate-dialog.component';

describe('SpaceTimeGateDialogComponent', () => {
  let component: SpaceTimeGateDialogComponent;
  let fixture: ComponentFixture<SpaceTimeGateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpaceTimeGateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpaceTimeGateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
