import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmaSettingComponent } from './sma-setting.component';

describe('SmaSettingComponent', () => {
  let component: SmaSettingComponent;
  let fixture: ComponentFixture<SmaSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmaSettingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmaSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
