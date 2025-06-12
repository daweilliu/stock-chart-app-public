import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings-panel',
  templateUrl: './settings-panel.component.html',
  styleUrls: ['./settings-panel.component.css'],
  standalone: true,
  imports: [FormsModule], // <-- Add this line
})
export class SettingsPanelComponent {
  //@Input() range: '1d' | '5d' | '1mo' | '6mo' | '1y' | '5y' | 'max' = '1mo';

  @Input() showDMark: boolean = false;
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

  onCheckboxChange(event: Event, emitter: EventEmitter<boolean>) {
    emitter.emit((event.target as HTMLInputElement).checked);
  }

  closePanel() {
    this.close.emit();
  }
}
