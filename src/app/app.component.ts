import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { AngularSplitModule } from 'angular-split';
import { StockChartComponent } from './stock-chart/stock-chart.component';
import { SettingsPanelComponent } from './common/cpmponents/settings-panel/settings-panel.component';
import { WatchlistPanelComponent } from './common/cpmponents/watchlist-panel/watchlist-panel.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StockDataService } from './services/stock-data.service';
import { LayoutService } from './services/layout.service';
import { HttpClient } from '@angular/common/http';
import { AppHeaderComponent } from './common/cpmponents/app-header/app-header.component';
import { SplitComponent, SplitGutterInteractionEvent } from 'angular-split';
import { Subscription } from 'rxjs';

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
  symbol = '';
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

  // Settings panel state
  showPanel = false;

  // SMA and D-Mark settings
  showDMark = false;
  showVolumeOverlap = false;
  showSma = false;
  showSma1 = true;
  showSma2 = false;
  showSma3 = false;
  showSma4 = false;
  showSma5 = false;
  sma1Period = 5;
  sma2Period = 21;
  sma3Period = 60;
  sma4Period = 120;
  sma5Period = 240;
  latestBarColor: string = '#1aff1a';

  // Removed duplicate and incorrect declaration of watchlist
  watchlist: any[] = [];
  userId = 'demo-user'; // Replace with real user id if you have auth
  layoutName = 'default';
  saveStatus: 'idle' | 'saving' | 'success' | 'error' = 'idle';
  private sub?: Subscription;
  constructor(
    private stockData: StockDataService,
    private layoutService: LayoutService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadLayout();
    this.fetchFullName(this.symbol);
    this.onSettingsApply();
    this.loadWatchlist();
  }

  ngAfterViewInit() {
    this.sub = this.mySplit.dragProgress$.subscribe((event) => {
      // If you want to trigger change detection, wrap in ngZone
      console.log('Splitter drag progress:', event);
      this.resizeChart();
    });
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
        }
      },
      error: (err) => {
        console.error('Failed to load layout:', err);
        this.saveStatus = 'error';
      },
    });
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
      }, 0);
    }
  }

  onRangeChange() {
    //this.fetchFullName(this.symbol);
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
    }
  }

  onSettingsApply() {
    this.showPanel = false; // Optionally close the panel after applying
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
    console.log('✅ Dragging in progress!', event);
  }

  toggleSettingsPanel() {
    this.showPanel = !this.showPanel;
    this.resizeChart();
  }

  toggleWatchlistPanel() {
    this.showWatchlist = !this.showWatchlist;
    this.resizeChart();
  }

  // Call saveLayout() whenever you want to persist changes
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
}
