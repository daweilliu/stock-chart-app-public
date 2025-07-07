import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AngularSplitModule } from 'angular-split';
import { StockChartComponent } from './stock-chart/stock-chart.component';
import { SettingsPanelComponent } from './common/components/settings-panel/settings-panel.component';
import { WatchlistPanelComponent } from './common/components/watchlist-panel/watchlist-panel.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StockDataService } from './services/stock-data.service';
import { LayoutService } from './services/layout.service';
import { HttpClient } from '@angular/common/http';
import { AppHeaderComponent } from './common/components/app-header/app-header.component';
import { SplitComponent } from 'angular-split';
import { Subscription } from 'rxjs';
import { SettingsService } from './services/settings.service';
import { InstrumentSettingService } from './services/instrument-setting.service';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [
    AppHeaderComponent,
    AngularSplitModule,
    StockChartComponent,
    SettingsPanelComponent,
    WatchlistPanelComponent,
    FormsModule,
    CommonModule,
  ],
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(StockChartComponent) chartComponent!: StockChartComponent;
  @ViewChild('mySplit') mySplit!: SplitComponent;

  // Symbol and range
  symbol = 'AAPL'; // Default symbol
  range: '1y' | '5y' | 'max' | 'ytd' | '2y' | '10y' = 'max';
  timeframe: 'daily' | 'weekly' | 'monthly' = 'daily';
  showWatchlist = false;
  fullName = '';
  isLoadingName = false;
  latestOpen = 0;
  latestHigh = 0;
  latestLow = 0;
  latestClose = 0;
  latestChangePct = 0;

  smas = [
    { enabled: true, value: 5 },
    { enabled: false, value: 21 },
    { enabled: false, value: 60 },
    { enabled: false, value: 120 },
    { enabled: false, value: 240 },
  ];

  // Settings panel state
  showPanel = false;

  // SMA and D-Mark settings
  showDMark = false;
  showDlSeq9 = false;
  showVolumeOverlap = false;
  showSma = false;
  latestBarColor: string = '#1aff1a';

  watchlist: any[] = [];
  userId = 'demo-user'; // Replace with real user id if you have auth
  layoutName = 'default';
  saveStatus: 'idle' | 'saving' | 'success' | 'error' = 'idle';
  startTime: string = '00:00:00'; // Default start time for DLSeq9
  private sub?: Subscription;

  constructor(
    private stockData: StockDataService,
    private layoutService: LayoutService,
    private settingsService: SettingsService,
    private instrumentSettingService: InstrumentSettingService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadLayout();
    this.loadSettings();
    this.fetchFullName(this.symbol);
    this.onSettingsApply();
    this.loadWatchlist();
    // Load DL-Seq-9 data for the initial symbol
    this.loadDLSeq9();
  }

  ngAfterViewInit() {
    this.sub = this.mySplit.dragProgress$.subscribe((event) => {
      this.resizeChart();
    });

    // Load DL-Seq-9 data after the chart component is initialized
    setTimeout(() => {
      this.loadDLSeq9();
    }, 500);
  }

  saveWatchlist() {
    const symbolList = this.watchlist.map((item) => item.symbol);
    this.http
      .post('http://localhost:3000/api/watchlist', {
        userId: this.userId,
        symbols: symbolList,
      })
      .subscribe();
  }

  loadWatchlist() {
    this.http
      .get<string[]>(`http://localhost:3000/api/watchlist/${this.userId}`)
      .subscribe((symbols) => {
        this.watchlist = symbols.map((symbol) => ({
          symbol,
          last: 0,
          chg: 0,
          chgPct: 0,
          ext: 0,
        }));
      });
  }

  saveLayout() {
    this.layoutService
      .saveLayout(this.userId, this.layoutName, {
        timeframe: this.timeframe,
        showDMark: this.showDMark,
        showVolumeOverlap: this.showVolumeOverlap,
        showSma: this.showSma,
        showDlSeq9: this.showDlSeq9,
      })
      .subscribe({
        next: () => (this.saveStatus = 'success'),
        error: () => (this.saveStatus = 'error'),
      });
  }

  loadLayout() {
    this.layoutService.loadLayout(this.userId, this.layoutName).subscribe({
      next: (layout) => {
        if (layout) {
          this.timeframe = layout.timeframe ?? this.timeframe;
          this.showDMark = layout.showDMark ?? this.showDMark;
          this.showVolumeOverlap =
            layout.showVolumeOverlap ?? this.showVolumeOverlap;
          this.showSma = layout.showSma ?? this.showSma;
          this.showDlSeq9 = layout.showDlSeq9 ?? this.showDlSeq9;

          // If DL-Seq-9 is enabled in the layout, load and display it
          if (this.showDlSeq9) {
            setTimeout(() => {
              this.loadDLSeq9();
            }, 200);
          }
        }
      },
      error: (err) => {
        console.error('Failed to load layout:', err);
        this.saveStatus = 'error';
      },
    });
  }

  saveSettings() {
    this.settingsService
      .saveSettings(this.userId, this.layoutName, {
        'sma-setting': this.smas,
      })
      .subscribe({
        next: () => (this.saveStatus = 'success'),
        error: () => (this.saveStatus = 'error'),
      });
  }

  loadSettings() {
    this.settingsService
      .loadSettings(this.userId, this.layoutName)
      .subscribe((setting_detail) => {
        if (setting_detail['sma-setting']) {
          this.smas = setting_detail['sma-setting'];
        }
      });
  }

  saveDLSeq9(timeToSave?: string | number) {
    // If timeToSave is provided, use it; otherwise use the component's startTime
    const actualStartTime = timeToSave || this.startTime;

    if (!actualStartTime) {
      console.warn('❌ No start time available to save DL-Seq-9');
      return;
    }

    if (!this.symbol) {
      console.error('Cannot save DL-Seq-9: No symbol selected');
      return;
    }

    if (!actualStartTime || actualStartTime === '00:00:00') {
      console.error('Cannot save DL-Seq-9: No valid start time set');
      return;
    }

    // Update the component's startTime
    this.startTime = actualStartTime as string;

    this.instrumentSettingService
      .saveSetting({
        userId: this.userId,
        layout: this.layoutName,
        symbol: this.symbol,
        settingType: 'dlSeq9',
        value: { startTime: actualStartTime },
      })
      .subscribe({
        next: (res) => {
          // console.log('DL-Seq-9 saved successfully:', actualStartTime, res);
          // If Show DL-Seq-9 is enabled, display it immediately after saving
          if (this.showDlSeq9 && this.chartComponent) {
            setTimeout(() => {
              this.displaySavedDLSeq9(actualStartTime as string);
            }, 100);
          }
        },
        error: (err) => {
          console.error('Error saving DL-Seq-9:', err);
        },
      });
  }

  loadDLSeq9() {
    this.instrumentSettingService
      .getSetting(this.userId, this.layoutName, this.symbol, 'dlSeq9')
      .subscribe((value) => {
        this.startTime = value.startTime || '00:00:00'; // Default to 00:00:00 if not set
        // If Show DL-Seq-9 is enabled and we have a saved start time, display it on the chart
        if (this.showDlSeq9 && value.startTime && this.chartComponent) {
          // Add a small delay to ensure chart is loaded
          setTimeout(() => {
            this.displaySavedDLSeq9(value.startTime);
          }, 100);
        }
      });
  }

  deleteDLSeq9() {
    this.instrumentSettingService
      .deleteSetting(this.userId, this.layoutName, this.symbol, 'dlSeq9')
      .subscribe((res) => {
        // console.log('DL-Seq-9 deleted successfully');
        // Clear the display and reset start time
        this.startTime = '00:00:00';
        if (this.chartComponent) {
          this.chartComponent.clearDLSeq9Display();
        }
      });
  }

  displaySavedDLSeq9(startTime: string) {
    // This method will trigger the display of saved DL-Seq-9 on the chart
    if (this.chartComponent) {
      // We need to simulate a click on the chart at the saved start time
      // This will trigger the DL-Seq-9 sequence to be displayed
      this.chartComponent.displayDLSeq9ForTime(startTime);
    } else {
      console.warn('Chart component is not available');
    }
  }

  addToWatchlist(symbol: string) {
    this.watchlist.push({
      symbol,
      last: 0,
      chg: 0,
      chgPct: 0,
      ext: 0,
    });
    this.saveWatchlist();
  }

  removeFromWatchlist(symbol: string) {
    this.watchlist = this.watchlist.filter((item) => item.symbol !== symbol);
    this.saveWatchlist();
  }

  loadSymbol(symbol: string) {
    this.symbol = `${symbol.toUpperCase().trim()}`;
    if (this.chartComponent) {
      this.chartComponent.onWatchlistSelect(symbol);
      this.fetchFullName(symbol);
      setTimeout(() => {
        if (this.chartComponent && this.chartComponent.resizeChart) {
          this.chartComponent.resizeChart();
        }
        // Load DL-Seq-9 data for the new symbol after chart is resized
        this.loadDLSeq9();
      }, 100);
    }
  }

  fetchFullName(symbol: string) {
    this.isLoadingName = true;
    this.stockData.searchSymbol(symbol).subscribe(
      (res) => {
        if (res && res.data && res.data.length > 0) {
          this.fullName = res.data[0].instrument_name;
        } else {
          this.fullName = symbol.toUpperCase();
        }
        this.isLoadingName = false;
      },
      () => {
        this.fullName = symbol.toUpperCase();
        this.isLoadingName = false;
      }
    );
  }

  getDisplayLabel(range: string): string {
    let rangeLabel = '';
    switch (range) {
      case '1y':
        rangeLabel = '1 Year';
        break;
      case '2y':
        rangeLabel = '2 Years';
        break;
      case '5y':
        rangeLabel = '5 Years';
        break;
      case '10y':
        rangeLabel = '10 Years';
        break;
      case 'max':
        rangeLabel = 'Max';
        break;
      case 'ytd':
        rangeLabel = 'Year to Date';
        break;
      default:
        rangeLabel = '';
    }
    return `${this.fullName} (${rangeLabel})`;
  }

  onLatestBar(bar: {
    open: number;
    high: number;
    low: number;
    close: number;
    color?: string;
  }) {
    this.latestOpen = bar.open;
    this.latestHigh = bar.high;
    this.latestLow = bar.low;
    this.latestClose = bar.close;
    if (bar.open) {
      this.latestChangePct = ((bar.close - bar.open) / bar.open) * 100;
    } else {
      this.latestChangePct = 0;
    }
    this.latestBarColor = this.getBarColor(bar.open, bar.close);
  }

  onWatchlistSelect(symbol: string) {
    this.symbol = symbol;
    if (this.chartComponent) {
      this.chartComponent.onWatchlistSelect(symbol);
      this.resizeChart();
      this.fetchFullName(symbol);
      // Load DL-Seq-9 data for the selected symbol
      setTimeout(() => {
        this.loadDLSeq9();
      }, 100);
    }
  }

  onSettingsApply() {
    this.showPanel = false;
    if (this.chartComponent) {
      this.chartComponent.reload();
      this.resizeChart();
    }
  }

  onSplitterDragEnd() {
    if (this.chartComponent && this.chartComponent.resizeChart) {
      this.chartComponent.resizeChart();
    }
  }

  onDragProgress(event: Event): void {
    // Handle drag progress if needed
  }

  toggleSettingsPanel() {
    this.showPanel = !this.showPanel;
    this.resizeChart();
  }

  toggleWatchlistPanel() {
    this.showWatchlist = !this.showWatchlist;
    this.resizeChart();
  }

  onTimeframeChange(tf: string) {
    if (['daily', 'weekly', 'monthly'].includes(tf)) {
      this.timeframe = tf as 'daily' | 'weekly' | 'monthly';
      this.saveLayout();
    }
  }

  onShowDMarkChange(val: boolean) {
    this.showDMark = val;
    this.saveLayout();
  }

  onShowDlSeq9Change(val: boolean) {
    this.showDlSeq9 = val;
    this.saveLayout();
    // If DL-Seq-9 is being turned on, load and display any saved data
    if (val) {
      this.loadDLSeq9();
    } else {
      // If DL-Seq-9 is being turned off, clear any displayed DL-Seq-9
      if (this.chartComponent) {
        this.chartComponent.clearDLSeq9Display();
      }
    }
  }

  onShowVolumeOverlapChange(val: boolean) {
    this.showVolumeOverlap = val;
    this.saveLayout();
  }

  onShowSmaChange(val: boolean) {
    this.showSma = val;
    this.saveLayout();
  }

  resizeChart() {
    setTimeout(() => {
      if (this.chartComponent && this.chartComponent.resizeChart) {
        this.chartComponent.resizeChart();
      }
    }, 0);
  }

  getBarColor(open: number, close: number): string {
    if (close > open) return '#00ff00';
    if (close < open) return '#ff0000';
    return '#cccccc';
  }

  // --- Update chart immediately when SMA settings change ---
  onSmasChange(newSmas: any[]) {
    this.smas = newSmas;
    this.saveSettings();
    if (this.chartComponent && this.chartComponent.updateSmas) {
      this.chartComponent.updateSmas(this.smas);
    }
  }

  onDlSeq9Click(event: { time: string | number; isShowing: boolean }) {
    this.startTime = event.time as string;
    // Also set the startTime in the chart component
    if (this.chartComponent) {
      this.chartComponent.startTime = event.time;
    }
  }

  testSave() {
    // Use a date format that matches your chart data (YYYY-MM-DD format)
    this.startTime = '2025-04-08'; // Use a date that exists in your chart data
    this.saveDLSeq9();
  }

  testLoad() {
    this.loadDLSeq9();
  }

  onDeleteDLSeq9() {
    this.deleteDLSeq9();
  }
}
