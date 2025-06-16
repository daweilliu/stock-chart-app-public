import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { SmaSettingComponent } from './sma-setting/sma-setting.component';

@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, SmaSettingComponent],
})
export class SettingsPanelComponent {
  @Input() showDMark = false;
  @Input() showVolumeOverlap = false;
  @Input() showSma = false;
  @Output() showDMarkChange = new EventEmitter<boolean>();
  @Output() showVolumeOverlapChange = new EventEmitter<boolean>();
  @Output() showSmaChange = new EventEmitter<boolean>();
  @Output() smasChange = new EventEmitter<any[]>();
  @Output() apply = new EventEmitter<void>();
  @Input() smas: any[] = [
    { enabled: true, value: 5 },
    { enabled: false, value: 21 },
    { enabled: false, value: 60 },
    { enabled: false, value: 120 },
    { enabled: false, value: 240 },
  ];

  showSmaSetting = false;

  // smas = [
  //   { enabled: true, value: 5 },
  //   { enabled: false, value: 21 },
  //   { enabled: false, value: 60 },
  //   { enabled: false, value: 120 },
  //   { enabled: false, value: 240 },
  // ];

  applySettings() {
    this.apply.emit();
  }

  onSmaApply(newSmas: any[]) {
    this.smas = newSmas;
    this.showSmaSetting = false;
    this.smasChange.emit(this.smas); // Emit to parent
  }
}
