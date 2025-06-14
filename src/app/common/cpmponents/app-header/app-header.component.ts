import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.css'],
})
export class AppHeaderComponent {
  @Input() symbol!: string;
  @Input() range!: string;
  @Input() timeframe!: string;
  @Input() fullName!: string;
  @Input() isLoadingName!: boolean;
  @Input() latestHigh!: number;
  @Input() latestLow!: number;
  @Input() latestOpen!: number;
  @Input() latestClose!: number;
  @Input() latestChangePct!: number;
  @Input() latestBarColor!: string;
  @Input() showPanel: boolean = false;
  @Input() showWatchlist: boolean = false;

  @Output() symbolChange = new EventEmitter<string>();
  @Output() rangeChange = new EventEmitter<
    '1y' | '2y' | '5y' | '10y' | 'max' | 'max'
  >();
  @Output() showPanelChange = new EventEmitter<boolean>();
  @Output() showWatchlistChange = new EventEmitter<boolean>();
  @Output() loadSymbol = new EventEmitter<void>();
  @Output() onRangeChange = new EventEmitter<void>();
  @Output() timeframeChange = new EventEmitter<
    'daily' | 'weekly' | 'monthly'
  >();

  onSymbolInput(event: any) {
    this.symbolChange.emit(event.target.value);
  }

  onRangeInput(event: any) {
    this.rangeChange.emit(event.target.value);
    this.onRangeChange.emit();
  }

  onTimeframeInput(event: any) {
    this.timeframeChange.emit(event.target.value);
  }

  triggerLoadSymbol() {
    this.loadSymbol.emit();
  }

  togglePanel() {
    if (this.showWatchlist) {
      this.showWatchlist = false;
      this.showWatchlistChange.emit(false);
    }
    this.showPanel = !this.showPanel;
    this.showPanelChange.emit(this.showPanel);
  }

  toggleWatchlist() {
    if (this.showPanel) {
      this.showPanel = false;
      this.showPanelChange.emit(false);
    }
    this.showWatchlist = !this.showWatchlist;
    this.showWatchlistChange.emit(this.showWatchlist);
  }
}
