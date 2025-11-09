import { CommonModule } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import {
  SpaceTimeGateComponent,
  SpaceTimeHorizonKey,
  SpaceTimePreset,
} from '../space-time-gate/space-time-gate.component';

export interface SpaceTimeGateDialogData {
  key: SpaceTimeHorizonKey;
  disabled?: boolean;
}

export interface SpaceTimeGateDialogResult {
  key: SpaceTimeHorizonKey;
  preset: SpaceTimePreset; // { key, label, timeframe }
}

@Component({
  selector: 'app-space-time-gate-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    SpaceTimeGateComponent,
  ],
  templateUrl: './space-time-gate-dialog.component.html',
  styleUrls: ['./space-time-gate-dialog.component.css'],
})
export class SpaceTimeGateDialogComponent {
  readonly selectedKey = signal<SpaceTimeHorizonKey>('short');
  private _lastPreset: SpaceTimePreset | null = null;

  constructor(
    private readonly dialogRef: MatDialogRef<
      SpaceTimeGateDialogComponent,
      SpaceTimeGateDialogResult | undefined
    >,
    @Inject(MAT_DIALOG_DATA) public data: SpaceTimeGateDialogData
  ) {
    if (data?.key) this.selectedKey.set(data.key);
  }

  onPick(e: { key: SpaceTimeHorizonKey; preset: SpaceTimePreset }) {
    this.selectedKey.set(e.key);
    this._lastPreset = e.preset;
  }

  onCancel() {
    this.dialogRef.close(undefined);
  }

  onApply() {
    if (!this._lastPreset) {
      const fallback: Record<SpaceTimeHorizonKey, SpaceTimePreset> = {
        short: { key: 'short', label: 'Short term', timeframe: '15m' },
        mediumShort: {
          key: 'mediumShort',
          label: 'Medium-short term',
          timeframe: '1D',
        },
        medium: { key: 'medium', label: 'Medium term', timeframe: '1W' },
        long: { key: 'long', label: 'Long term', timeframe: '1M' },
      };
      this._lastPreset = fallback[this.selectedKey()];
    }
    this.dialogRef.close({
      key: this.selectedKey(),
      preset: this._lastPreset!,
    });
  }
}
