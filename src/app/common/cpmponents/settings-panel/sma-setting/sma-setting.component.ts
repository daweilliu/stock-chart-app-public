import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sma-setting',
  templateUrl: './sma-setting.component.html',
  styleUrls: ['./sma-setting.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SmaSettingComponent {
  @Input() smas = [
    { enabled: false, value: 5 },
    { enabled: false, value: 21 },
    { enabled: false, value: 60 },
    { enabled: false, value: 120 },
    { enabled: false, value: 240 },
  ];
  @Output() close = new EventEmitter<void>();
  @Output() apply = new EventEmitter<any>();

  onClose() {
    this.close.emit();
  }

  onApply() {
    this.apply.emit(this.smas);
  }
}
