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
import { TrueVerticalLineService } from '../services/true-vertical-line.service';
import { CommonModule, Time } from '@angular/common';
import {
  loadSymbolDataExternal,
  getOutputSize,
  getInterval,
} from '../common/chart-helpers';
import { MatMenuModule } from '@angular/material/menu';
import { MatMenuTrigger } from '@angular/material/menu';
import {
  CandlestickData,
  createSeriesMarkers,
  IChartApi,
  ISeriesApi,
} from 'lightweight-charts';

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
  @Input() timeframe:
    | '1m'
    | '15m'
    | '30m'
    | '60m'
    | 'daily'
    | 'weekly'
    | 'monthly' = 'daily';
  @Input() showDMark: boolean = true;
  @Input() showDlSeq9: boolean = true;
  @Input() showVolumeOverlap: boolean = true;
  @ViewChild('chartContainer', { static: false }) chartContainer!: ElementRef;
  @ViewChild('td9Overlay', { static: true })
  td9Overlay!: ElementRef<HTMLDivElement>;
  @ViewChild('chartMenu')
  chartMenuRef!: ElementRef;
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
  @Input() savedStartTime: string | number | null = null; // Input for saved start time

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

  chart!: IChartApi;
  series!: ISeriesApi<'Candlestick'>;
  data: CandlestickData[] = [];
  td9Markers: Array<{ time: Time; logicalIndex: number; isBull: boolean }> = [];

  constructor(
    private chartService: StockChartService,
    private dataService: StockDataService,
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

    let needsDataReload = false;
    let needsChartRebuild = false;

    // Check if we need to rebuild the chart (only for fundamental changes)
    if (changes['timeframe'] && this.chartContainer) {
      needsChartRebuild = true;
      needsDataReload = true;
    }

    // Check if we need to reload data from API (only for data-affecting changes)
    if (changes['symbol'] || changes['range'] || changes['timeframe']) {
      needsDataReload = true;
    }

    // Handle chart rebuild if needed
    if (needsChartRebuild) {
      this.chartService.destroyChart();
      this.chartService.initChart(this.chartContainer.nativeElement);
      this.resizeChart();
    }

    // Handle data reload if needed (single API call for all changes)
    if (needsDataReload && this.chartContainer && this.chartService.chart) {
      this.loadSymbolData();
      return; // Exit early since loadSymbolData will handle all display updates
    }

    // Handle display-only changes without API calls
    if (this.chartContainer && this.chartService.chart) {
      let needsDisplayUpdate = false;

      // Handle DL-Seq-9 setting changes
      if (changes['showDlSeq9']) {
        if (!this.showDlSeq9) {
          this.clearDLSeq9Display();
        }
        needsDisplayUpdate = true;
      }

      // Handle D-Mark, Volume, or SMA changes that only affect display
      if (
        changes['showDMark'] ||
        changes['showVolumeOverlap'] ||
        changes['showSma'] ||
        changes['showSma1'] ||
        changes['showSma2'] ||
        changes['showSma3'] ||
        changes['showSma4'] ||
        changes['showSma5'] ||
        changes['sma1Period'] ||
        changes['sma2Period'] ||
        changes['sma3Period'] ||
        changes['sma4Period'] ||
        changes['sma5Period']
      ) {
        needsDisplayUpdate = true;
      }

      // Handle savedStartTime changes
      if (changes['savedStartTime']) {
        needsDisplayUpdate = true;
      }

      // Only reload if display settings actually changed
      if (needsDisplayUpdate) {
        this.loadSymbolData();
      }
    }
  }

  ngOnInit() {
    this.dlSeq9Click.subscribe(({ time, isShowing }) => {
      // Use time and isShowing here
      this.showDLSeq9 = isShowing; // Update local state if needed
      this.startTime = time; // Set the start time for saving
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
      this.trueVerticalLineService, // Add the TRUE vertical line service
      this.savedStartTime ? String(this.savedStartTime) : undefined // Use savedStartTime for auto-display
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

    this.chartService.destroyChart();
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
    const timeToSave =
      this.startTime !== null ? this.startTime : this.savedStartTime;

    if (timeToSave !== null && timeToSave !== undefined) {
      this.saveDLSeq9.emit(timeToSave);
    } else {
      console.warn('❌ No start time available to save DL-Seq-9');
      console.warn(
        '💡 Try clicking on a swing high/low first to create a DL-Seq-9 sequence'
      );
    }
  }

  deleteMarkers() {
    if (this.isDestroyed) return;

    // Clear all chart markers (DL-Seq-9 markers)
    this.clearChartMarkers();

    // Clear any vertical lines that might be associated with DL-Seq-9
    this.clearVerticalLines();

    // Clear chart markers and restore D-Mark markers if they should be shown
    if (this.showDMark) {
      // Restore D-Mark markers without full data reload
      // The markers will be restored when the chart is next updated
      console.log('D-Mark markers will be restored on next chart update');
    } else {
      // Clear all markers if D-Mark is not enabled
      this.chartService.clearDMarkMarkers();
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
        this.trueVerticalLineService.clearVerticalLines(
          this.chartService.candleSeries
        );
      } catch (error) {
        console.warn('Error clearing true vertical lines:', error);
      }
    }
  }

  openMenu(event: MouseEvent, trigger: MatMenuTrigger) {
    event.preventDefault();
    // Set menu position
    (trigger as any)._setMenuPosition({ x: event.clientX, y: event.clientY });
    trigger.openMenu();
  }

  displayDLSeq9ForTime(startTime: string) {
    // This method displays DL-Seq-9 sequence for a saved start time
    if (!this.chartService.isChartValid() || this.isDestroyed) return;

    // We need to find the bar data for the given start time and simulate a click
    // First, let's load the symbol data and then trigger the DL-Seq-9 display
    setTimeout(() => {
      this.triggerDLSeq9Display(startTime);
    }, 500); // Give time for chart data to load
  }

  clearDLSeq9Display() {
    // Clear any displayed DL-Seq-9 markers and vertical lines
    if (!this.isDestroyed) {
      this.clearChartMarkers();
      this.clearVerticalLines();
      this.showDLSeq9 = false;
      this.startTime = null;
    }
  }

  private triggerDLSeq9Display(startTime: string) {
    // This method simulates a chart click to trigger DL-Seq-9 display
    if (!this.chartService.isChartValid() || this.isDestroyed) return;

    try {
      // Get the chart's time scale to find the appropriate time
      const timeScale = this.chartService.chart.timeScale();

      // For auto-display, the saved DL-Seq-9 logic is handled in chart-helpers
      // No need to reload data here - just log for now
      console.log('DL-Seq-9 auto-display triggered for time:', startTime);
      // The display logic is handled in chart-helpers.ts autoDisplaySavedDLSeq9
    } catch (error) {
      console.warn('Error displaying saved DL-Seq-9:', error);
    }
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
