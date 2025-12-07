import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

// Space-Time Gate dialog + types
import {
  SpaceTimeGateDialogComponent,
  SpaceTimeGateDialogResult,
} from './space-time-gate-dialog/space-time-gate-dialog.component';

// Space-Time Gate key type (15m/1D/1W/1M mapping lives in the dialog/STG component)
import { SpaceTimeHorizonKey } from './space-time-gate/space-time-gate.component';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
  ],
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.css'],
})
export class SettingsPanelComponent {
  // ========= Inputs (bound from parent AppComponent) =========
  @Input() showDMark = false;
  @Input() showDlSeq9 = false;
  @Input() showVolumeOverlap = false;
  @Input() showSma = false;

  // SMA list + two-way binding
  @Input() smas: any[] = [];

  // Space-Time Gate toggle + current selection key
  @Input() showSpaceTimeGate = false;
  @Input() stgKey: SpaceTimeHorizonKey = 'short';

  // ========= Outputs (notify parent) =========
  @Output() showDMarkChange = new EventEmitter<boolean>();
  @Output() showDlSeq9Change = new EventEmitter<boolean>();
  @Output() showVolumeOverlapChange = new EventEmitter<boolean>();
  @Output() showSmaChange = new EventEmitter<boolean>();

  @Output() smasChange = new EventEmitter<any[]>();

  @Output() showSpaceTimeGateChange = new EventEmitter<boolean>();
  @Output() spaceTimeFrameChange = new EventEmitter<
    '15m' | '1D' | '1W' | '1M'
  >();

  // If your parent opens the SMA dialog, you can forward a click via this output
  @Output() openSmaSetting = new EventEmitter<void>();

  constructor(private readonly dialog: MatDialog) {}

  // Optional helper if you edit SMAs inside this panel and want to emit the change
  onSmasChange(list: any[]) {
    this.smas = list;
    this.smasChange.emit(list);
  }

  // Open the Space-Time Gate dialog (MatDialog)
  openStgDialog(): void {
    const ref = this.dialog.open(SpaceTimeGateDialogComponent, {
      width: '420px',
      panelClass: 'stg-dialog-panel', // 👈 add this
      data: { key: this.stgKey, disabled: !this.showSpaceTimeGate },
    });
    ref.afterClosed().subscribe((result) => {
      if (!result) return; // user cancelled
      this.stgKey = result.key;
      this.spaceTimeFrameChange.emit(result.preset.timeframe);

      // Example wiring opportunities:
      // this.chartService.setResolution(result.preset.timeframe);
      // this.overlayService.updateSpaceTimeGate(result.key);
    });
  }

  onSmaEditClick(event: MouseEvent) {
    event.stopPropagation();
    this.openSmaSetting.emit();
  }
}
