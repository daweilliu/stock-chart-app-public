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

@Component({
  selector: 'app-stock-chart',
  templateUrl: './stock-chart.component.html',
  styleUrls: ['./stock-chart.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class StockChartComponent implements AfterViewInit, OnChanges {
  @Input() symbol: string = 'AAPL';
  @Input() range: 'ytd' | '1y' | '2y' | '5y' | '10y' | 'max' = '10y';
  @Input() timeframe: 'daily' | 'weekly' | 'monthly' = 'daily';
  @Input() showDMark: boolean = true;
  @Input() showVolumeOverlap: boolean = true;
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;

  // SMA Inputs
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
    this.resizeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['timeframe'] && this.chartContainer) {
      if (this.chartService.chart) {
        this.chartService.chart.remove();
      }
      this.chartService.initChart(this.chartContainer.nativeElement);
      this.loadSymbolData();
      this.resizeChart();
    }
  }

  loadSymbolData(symbol: string = this.symbol) {
    loadSymbolDataExternal(
      symbol,
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
      this.showVolumeOverlap,
      this.chartService,
      this.dataService,
      this.latestBar,
      this.barClicked
    );
  }

  onWatchlistSelect(symbol: string) {
    if (this.chartService.chart) {
      this.chartService.chart.remove();
    }
    this.chartService.initChart(this.chartContainer.nativeElement);
    this.loadSymbolData(symbol);
    this.showWatchlist = false;
  }

  reload() {
    if (this.chartService.chart) {
      this.chartService.chart.remove();
    }
    this.chartService.initChart(this.chartContainer.nativeElement);
    this.loadSymbolData(this.symbol);
    this.showPanel = false;
  }

  resizeChart() {
    if (this.chartService.chart && this.chartContainer) {
      const width = this.chartContainer.nativeElement.offsetWidth;
      const height = this.chartContainer.nativeElement.offsetHeight;
      this.chartService.chart.resize(width, height);
    }
  }

  // --- Add this method to update SMAs from settings panel ---
  updateSmas(smas: any[]) {
    // Defensive: fallback to default if not enough SMAs
    this.showSma1 = !!smas[0]?.enabled;
    this.sma1Period = smas[0]?.value ?? 5;
    this.showSma2 = !!smas[1]?.enabled;
    this.sma2Period = smas[1]?.value ?? 21;
    this.showSma3 = !!smas[2]?.enabled;
    this.sma3Period = smas[2]?.value ?? 60;
    this.showSma4 = !!smas[3]?.enabled;
    this.sma4Period = smas[3]?.value ?? 120;
    this.showSma5 = !!smas[4]?.enabled;
    this.sma5Period = smas[4]?.value ?? 240;

    this.reload(); // Redraw chart with new SMA settings
  }
}
