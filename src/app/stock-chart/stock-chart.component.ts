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
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { StockChartService } from '../services/stock-chart.service';
import { StockDataService } from '../services/stock-data.service';
import { VerticalLinePluginService } from '../services/vertical-line-plugin.service';
import { TrueVerticalLineService } from '../services/true-vertical-line.service';
import { CommonModule } from '@angular/common';
import {
  loadSymbolDataExternal,
  getOutputSize,
  getInterval,
} from '../common/chart-helpers';
import { MatMenuModule } from '@angular/material/menu';
import { MatMenuTrigger } from '@angular/material/menu';
import { createSeriesMarkers } from 'lightweight-charts';

@Component({
  selector: 'app-stock-chart',
  templateUrl: './stock-chart.component.html',
  styleUrls: ['./stock-chart.component.css'],
  standalone: true,
  imports: [CommonModule, MatMenuModule],
})
export class StockChartComponent
  implements AfterViewInit, OnChanges, OnInit, OnDestroy
{
  @Input() symbol: string = 'AAPL';
  @Input() range: 'ytd' | '1y' | '2y' | '5y' | '10y' | 'max' = '10y';
  @Input() timeframe: 'daily' | 'weekly' | 'monthly' = 'daily';
  @Input() showDMark: boolean = true;
  @Input() showDlSeq9: boolean = true;
  @Input() showVolumeOverlap: boolean = true;
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  @ViewChild('chartMenu') chartMenuRef!: ElementRef;
  @ViewChild('menuTrigger', { static: false })
  menuTrigger!: ElementRef<HTMLButtonElement>;
  @ViewChild(MatMenuTrigger, { static: false }) matMenuTrigger!: MatMenuTrigger;
  // SMA Inputs
  @Input() showSma: boolean = false;
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
  @Output() dlSeq9Click = new EventEmitter<{
    time: string | number;
    isShowing: boolean;
  }>();

  @Output() saveDLSeq9 = new EventEmitter<string | number>();
  @Output() deleteDLSeq9 = new EventEmitter<void>();

  showWatchlist = false;
  watchlist: string[] = ['AAPL', 'MSFT', 'GOOG'];
  showPanel = false;
  showChartMenu = false;
  chartMenuPosition = { x: 0, y: 0 };
  showDLSeq9 = false; // Control visibility of DLSeq9
  startTime: string | number | null = null;
  private isDestroyed = false; // Flag to track if component is destroyed

  constructor(
    private chartService: StockChartService,
    private dataService: StockDataService,
    private verticalLineService: VerticalLinePluginService,
    private trueVerticalLineService: TrueVerticalLineService
  ) {
    this.showDLSeq9 = false;
  }

  ngAfterViewInit(): void {
    if (this.isDestroyed) return;

    this.chartService.destroyChart();
    this.chartService.initChart(this.chartContainer.nativeElement);
    this.loadSymbolData();
    this.resizeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.isDestroyed) return;

    if (changes['timeframe'] && this.chartContainer) {
      if (this.chartService.chart) {
        this.chartService.chart.remove();
      }
      this.chartService.initChart(this.chartContainer.nativeElement);
      this.loadSymbolData();
      this.resizeChart();
    }

    // Handle D-Mark setting changes
    if (
      changes['showDMark'] &&
      this.chartContainer &&
      this.chartService.chart
    ) {
      // Reload data to apply D-Mark marker changes and clear DL Sequence markers
      this.loadSymbolData();
    }
  }

  ngOnInit() {
    this.dlSeq9Click.subscribe(({ time, isShowing }) => {
      // Use time and isShowing here
      this.showDLSeq9 = isShowing; // Update local state if needed
      this.startTime;
      console.log('DLSeq9:', time, isShowing);
    });
  }

  loadSymbolData(symbol: string = this.symbol) {
    loadSymbolDataExternal(
      symbol,
      this.range,
      this.timeframe,
      this.showSma,
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
      this.showDlSeq9,
      this.showVolumeOverlap,
      this.chartService,
      this.dataService,
      this.latestBar,
      this.barClicked,
      this.dlSeq9Click, // Pass the EventEmitter for DLSeq9 click info
      this.verticalLineService, // Add the vertical line service
      this.trueVerticalLineService // Add the TRUE vertical line service
    );
  }

  onWatchlistSelect(symbol: string) {
    if (this.isDestroyed) return;

    if (this.chartService.chart) {
      this.chartService.chart.remove();
    }
    this.chartService.initChart(this.chartContainer.nativeElement);
    this.loadSymbolData(symbol);
    this.showWatchlist = false;
  }

  reload() {
    if (this.isDestroyed) return;

    if (this.chartService.chart) {
      this.chartService.chart.remove();
    }
    this.chartService.initChart(this.chartContainer.nativeElement);
    this.loadSymbolData(this.symbol);
    this.showPanel = false;
  }

  resizeChart() {
    if (this.isDestroyed || !this.chartService.chart || !this.chartContainer)
      return;

    const width = this.chartContainer.nativeElement.offsetWidth;
    const height = this.chartContainer.nativeElement.offsetHeight;
    this.chartService.chart.resize(width, height);
  }

  // Update SMAs from settings panel
  updateSmas(smas: any[]) {
    if (this.isDestroyed) return;

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

  onChartContextMenu(event: MouseEvent) {
    event.preventDefault();
    const triggerElem = this.menuTrigger.nativeElement;
    // Move the trigger button to the mouse position
    triggerElem.style.position = 'fixed';
    triggerElem.style.left = `${event.clientX}px`;
    triggerElem.style.top = `${event.clientY}px`;
    triggerElem.style.display = 'block';

    // Open the menu
    this.matMenuTrigger.openMenu();

    // Optionally, hide the button after menu opens
    setTimeout(() => {
      triggerElem.style.display = 'none';
    }, 0);
  }

  onSaveDLSeq9() {
    this.saveDLSeq9.emit(this.startTime !== null ? this.startTime : undefined);
  }

  deleteMarkers() {
    if (this.isDestroyed) return;
    
    // Clear all chart markers (DL-Seq-9 markers)
    this.clearChartMarkers();
    
    // Clear any vertical lines that might be associated with DL-Seq-9
    this.clearVerticalLines();
    
    // Clear chart markers and restore D-Mark markers if they should be shown
    if (this.showDMark) {
      // Reload the symbol data to restore D-Mark markers
      this.loadSymbolData();
    }
    
    this.showDLSeq9 = false; // Hide the popup menu if needed
    this.startTime = null; // Reset start time
    this.deleteDLSeq9.emit(); // Notify parent (this will handle backend deletion)
  }

  clearChartMarkers() {
    if (this.chartService.isChartValid() && this.chartService.candleSeries) {
      // Use the chart service's built-in clearMarkers method
      this.chartService.clearMarkers();
    }
  }

  clearVerticalLines() {
    // Clear vertical lines using the services
    if (this.trueVerticalLineService && this.chartService.isChartValid()) {
      try {
        this.trueVerticalLineService.clearVerticalLines(this.chartService.candleSeries);
      } catch (error) {
        console.warn('Error clearing true vertical lines:', error);
      }
    }
    
    if (this.verticalLineService && this.chartService.isChartValid()) {
      try {
        // Clear vertical lines from the regular vertical line service
        this.verticalLineService.removeVerticalLines(this.chartService.chart);
      } catch (error) {
        console.warn('Error clearing vertical lines:', error);
      }
    }
  }

  openMenu(event: MouseEvent, trigger: MatMenuTrigger) {
    event.preventDefault();
    // Set menu position
    (trigger as any)._setMenuPosition({ x: event.clientX, y: event.clientY });
    trigger.openMenu();
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    this.chartService.destroyChart();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (!this.isDestroyed) {
      this.resizeChart();
    }
  }
}
