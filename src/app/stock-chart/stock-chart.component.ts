import {
  Component,
  Input,
  AfterViewInit,
  ElementRef,
  ViewChild,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { StockChartService } from '../services/stock-chart.service';
import { StockDataService } from '../services/stock-data.service';
import { CommonModule } from '@angular/common';
import {
  loadSymbolDataExternal,
  getOutputSize,
  getInterval,
} from '../common/chart-helpers';

import { WatchlistPanelComponent } from '../common/cpmponents/watchlist-panel/watchlist-panel.component';

@Component({
  selector: 'app-stock-chart',
  templateUrl: './stock-chart.component.html',
  styleUrls: ['./stock-chart.component.css'],
  standalone: true,
  imports: [CommonModule, WatchlistPanelComponent],
})
export class StockChartComponent implements AfterViewInit, OnChanges {
  @Input() symbol: string = 'AAPL';
  @Input() range: 'ytd' | '1y' | '2y' | '5y' | '10y' | 'max' = '10y';
  @Input() timeframe: 'daily' | 'weekly' | 'monthly' = 'daily';
  @Input() showDMark: boolean = true;
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  @Input() sma1Period: number = 5;
  @Input() showSma1: boolean = true;
  @Input() sma2Period: number = 21;
  @Input() showSma2: boolean = false;
  @Input() sma3Period: number = 60;
  @Input() showSma3: boolean = false;
  @Input() sma4Period: number = 120;
  @Input() showSma4: boolean = false;
  @Input() sma5Period: number = 240;
  @Input() showSma5: boolean = false;
  @Output() latestBar = new EventEmitter<{
    open: number;
    high: number;
    low: number;
    close: number;
  }>();
  @Output() barClicked = new EventEmitter<{
    open: number;
    high: number;
    low: number;
    close: number;
  }>();

  showWatchlist = false;
  watchlist: string[] = ['AAPL', 'MSFT', 'GOOG'];
  showPanel = false;

  constructor(
    private chartService: StockChartService,
    private dataService: StockDataService
  ) {}

  ngAfterViewInit(): void {
    this.chartService.initChart(this.chartContainer.nativeElement);
    this.loadSymbolData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['symbol'] || changes['range'] || changes['timeframe']) &&
      this.chartContainer
    ) {
      if (this.chartService.chart) {
        this.chartService.chart.remove();
      }
      this.chartService.initChart(this.chartContainer.nativeElement);
      this.loadSymbolData();
    }
  }

  loadSymbolData() {
    loadSymbolDataExternal(
      this.symbol,
      this.range,
      this.timeframe,
      this.showSma1,
      this.sma1Period,
      this.showSma2,
      this.sma2Period,
      this.showSma3,
      this.sma3Period,
      this.showSma4,
      this.sma4Period,
      this.showSma5,
      this.sma5Period,
      this.showDMark,
      this.chartService,
      this.dataService,
      this.latestBar,
      this.barClicked
    );
  }

  onWatchlistSelect(symbol: string) {
    this.symbol = symbol;
    // Optionally reload chart data here if needed
    this.loadSymbolData();
    this.showWatchlist = false;
  }

  reload() {
    this.loadSymbolData();
    this.showPanel = false;
  }
}
