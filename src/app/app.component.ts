import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularSplitModule } from 'angular-split';
import { StockChartComponent } from './stock-chart/stock-chart.component';
import { SettingsPanelComponent } from './common/cpmponents/settings-panel/settings-panel.component';
import { WatchlistPanelComponent } from './common/cpmponents/watchlist-panel/watchlist-panel.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { StockDataService } from './services/stock-data.service';
import { HttpClient } from '@angular/common/http';
import { AppHeaderComponent } from './common/cpmponents/app-header/app-header.component';

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
export class AppComponent implements OnInit {
  @ViewChild(StockChartComponent) chartComponent!: StockChartComponent;
  // Symbol and range
  symbol = 'AAPL';
  range: '1y' | '5y' | 'max' | 'ytd' | '2y' | '10y' = '1y';
  timeframe: 'daily' | 'weekly' | 'monthly' = 'daily';
  showWatchlist = false;
  // watchlist = [
  //   { symbol: 'AAPL', last: 0, chg: 0, chgPct: 0, ext: 0 },
  //   { symbol: 'MSFT', last: 0, chg: 0, chgPct: 0, ext: 0 },
  //   { symbol: 'GOOG', last: 0, chg: 0, chgPct: 0, ext: 0 },
  // ];
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

  constructor(private stockData: StockDataService, private http: HttpClient) {}

  ngOnInit() {
    this.fetchFullName(this.symbol);
    this.loadWatchlist();
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
    this.latestBarColor = bar.color || '#1aff1a'; // fallback if color not provided
  }

  onWatchlistSelect(symbol: string) {
    this.symbol = symbol;
    if (this.chartComponent) {
      this.chartComponent.onWatchlistSelect(symbol);
      setTimeout(() => {
        if (this.chartComponent && this.chartComponent.resizeChart) {
          this.chartComponent.resizeChart();
        }
      }, 0);
      this.fetchFullName(symbol);
    }
  }

  onSettingsApply() {
    this.showPanel = false; // Optionally close the panel after applying
    if (this.chartComponent) {
      this.chartComponent.reload();
      setTimeout(() => {
        if (this.chartComponent && this.chartComponent.resizeChart) {
          this.chartComponent.resizeChart();
        }
      }, 0);
    }
  }

  onSplitterDragEnd() {
    if (this.chartComponent && this.chartComponent.resizeChart) {
      this.chartComponent.resizeChart();
    }
  }

  toggleSettingsPanel() {
    this.showPanel = !this.showPanel;
    setTimeout(() => {
      if (this.chartComponent && this.chartComponent.resizeChart) {
        this.chartComponent.resizeChart();
      }
    }, 0);
  }

  toggleWatchlistPanel() {
    this.showWatchlist = !this.showWatchlist;
    setTimeout(() => {
      if (this.chartComponent && this.chartComponent.resizeChart) {
        this.chartComponent.resizeChart();
      }
    }, 0);
  }
}
