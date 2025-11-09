import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

export type SpaceTimeHorizonKey = 'short' | 'mediumShort' | 'medium' | 'long';
export type SpaceTimeFrame = '15m' | '1D' | '1W' | '1M';

export interface SpaceTimePreset {
  key: SpaceTimeHorizonKey;
  label: string;
  timeframe: SpaceTimeFrame;
}

@Component({
  selector: 'app-space-time-gate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './space-time-gate.component.html',
  styleUrls: ['./space-time-gate.component.css'],
})
export class SpaceTimeGateComponent {
  @Input({ required: false }) set configPresets(
    v: SpaceTimePreset[] | null | undefined
  ) {
    if (v?.length) this._presets.set(v);
  }

  @Input({ required: false }) set model(
    v: SpaceTimeHorizonKey | null | undefined
  ) {
    if (v) this.value.set(v);
  }

  @Input() disabled = false;

  @Output() selectionChange = new EventEmitter<{
    key: SpaceTimeHorizonKey;
    preset: SpaceTimePreset;
  }>();

  private readonly _presets = signal<SpaceTimePreset[]>([
    { key: 'short', label: 'Short term', timeframe: '15m' },
    { key: 'mediumShort', label: 'Medium-short term', timeframe: '1D' },
    { key: 'medium', label: 'Medium term', timeframe: '1W' },
    { key: 'long', label: 'Long term', timeframe: '1M' },
  ]);

  readonly value = signal<SpaceTimeHorizonKey>('short');
  presets = this._presets.asReadonly();
  selectId = `stg-select-${Math.random().toString(36).slice(2, 8)}`;

  currentPreset(): SpaceTimePreset {
    const found = this._presets().find((p) => p.key === this.value());
    return found ?? this._presets()[0];
  }

  onChange(raw: string) {
    const key = raw as SpaceTimeHorizonKey;
    this.value.set(key);
    this.selectionChange.emit({ key, preset: this.currentPreset() });
  }
}
