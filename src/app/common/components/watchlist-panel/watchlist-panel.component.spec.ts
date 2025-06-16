import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchlistPanelComponent } from './watchlist-panel.component';

describe('WatchlistPanelComponent', () => {
  let component: WatchlistPanelComponent;
  let fixture: ComponentFixture<WatchlistPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WatchlistPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatchlistPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
