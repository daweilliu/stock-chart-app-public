import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  HostListener,
} from '@angular/core';
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
  @ViewChild('symbolInput') symbolInput!: ElementRef<HTMLInputElement>;
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
  @Output() loadSymbol = new EventEmitter<string>();
  @Output() onRangeChange = new EventEmitter<void>();
  @Output() timeframeChange = new EventEmitter<
    '1m' | '15m' | '30m' | '60m' | 'daily' | 'weekly' | 'monthly'
  >();

  // Add debouncing for symbol input
  private symbolInputTimeout: any;

  @HostListener('document:keydown', ['$event'])
  handleGlobalKeydown(event: KeyboardEvent) {
    const active = document.activeElement;
    // If not focused on an input, textarea, or contenteditable
    if (
      active &&
      !(active instanceof HTMLInputElement) &&
      !(active instanceof HTMLTextAreaElement) &&
      !(active as HTMLElement).isContentEditable
    ) {
      if (/^[a-zA-Z0-9]$/.test(event.key)) {
        const inputEl = this.symbolInput.nativeElement;
        if (inputEl.value.length > 0) {
          inputEl.value = '';
          //this.symbolChange.emit('');
        }
        inputEl.focus();
      }
    }
  }

  onSymbolInput(event: any) {
    const value = event.target.value.toUpperCase();

    // Clear any existing timeout
    if (this.symbolInputTimeout) {
      clearTimeout(this.symbolInputTimeout);
    }

    // Only emit change after user stops typing for 1 second
    this.symbolInputTimeout = setTimeout(() => {
      if (value.length >= 1) {
        console.log('Symbol input changed:', value);
        // Only load if there's at least 1 character
        //this.symbolChange.emit(value);
      }
    }, 1); // 1 second delay
  }

  onRangeInput(event: any) {
    this.rangeChange.emit(event.target.value);
    this.onRangeChange.emit();
  }

  onTimeframeInput(event: any) {
    this.timeframeChange.emit(event.target.value);
  }

  triggerLoadSymbol(symbol: string) {
    this.loadSymbol.emit(symbol);
    setTimeout(() => {
      this.symbolInput.nativeElement.select();
    }, 0);
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
