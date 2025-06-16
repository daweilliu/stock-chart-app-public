import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SmaSettingComponent } from './sma-setting/sma-setting.component';

@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.css'],
  standalone: true,
  imports: [FormsModule, MatIconModule, SmaSettingComponent],
})
export class SettingsPanelComponent {
  @Input() showDMark: boolean = false;
  @Input() showVolumeOverlap: boolean = false;
  @Input() showSma = false;
  @Input() showSma1: boolean = true;
  @Input() sma1Period: number = 5;
  @Input() showSma2: boolean = false;
  @Input() sma2Period: number = 21;
  @Input() showSma3: boolean = false;
  @Input() sma3Period: number = 60;
  @Input() showSma4: boolean = false;
  @Input() sma4Period: number = 120;
  @Input() showSma5: boolean = false;
  @Input() sma5Period: number = 240;

  @Output() showDMarkChange = new EventEmitter<boolean>();
  @Output() showVolumeOverlapChange = new EventEmitter<boolean>();
  @Output() showSmaChange = new EventEmitter<boolean>();
  @Output() showSma1Change = new EventEmitter<boolean>();
  @Output() sma1PeriodChange = new EventEmitter<number>();
  @Output() showSma2Change = new EventEmitter<boolean>();
  @Output() sma2PeriodChange = new EventEmitter<number>();
  @Output() showSma3Change = new EventEmitter<boolean>();
  @Output() sma3PeriodChange = new EventEmitter<number>();
  @Output() showSma4Change = new EventEmitter<boolean>();
  @Output() sma4PeriodChange = new EventEmitter<number>();
  @Output() showSma5Change = new EventEmitter<boolean>();
  @Output() sma5PeriodChange = new EventEmitter<number>();

  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<void>();

  showSmaSetting = false;
  smas = [
    { enabled: true, value: 5 },
    { enabled: false, value: 21 },
    { enabled: false, value: 60 },
    { enabled: false, value: 120 },
    { enabled: false, value: 240 },
  ];

  applySettings() {
    this.apply.emit();
  }

  onShowSmaChange(val: boolean) {
    this.showSma = val;
    this.showSmaChange.emit(val);
  }

  onEdit(setting: string) {
    // Implement your edit logic here
    console.log('Edit clicked for:', setting);
  }
  onSmaApply(newSmas: any[]) {
    this.smas = newSmas;
    this.showSmaSetting = false;
    // emit changes if needed
    this.sma1PeriodChange.emit(this.sma1Period);
    this.sma2PeriodChange.emit(this.sma2Period);
    this.sma3PeriodChange.emit(this.sma3Period);
    this.sma4PeriodChange.emit(this.sma4Period);
    this.sma5PeriodChange.emit(this.sma5Period);
  }
}
