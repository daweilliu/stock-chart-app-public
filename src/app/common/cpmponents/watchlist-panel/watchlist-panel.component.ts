import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, forkJoin } from 'rxjs';
import { StockDataService } from '../../../services/stock-data.service'; // adjust the path if needed

@Component({
  selector: 'app-watchlist-panel',
  templateUrl: './watchlist-panel.component.html',
  styleUrls: ['./watchlist-panel.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class WatchlistPanelComponent implements OnInit {
  constructor(private stockData: StockDataService) {}
  // @Input() symbols: string[] = [];
  @Output() select = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  @Output() addToDB = new EventEmitter<string>();
  @Output() removeFromDB = new EventEmitter<string>();

  newSymbol = '';
  @Input() symbols: {
    symbol: string;
    last: number;
    chg: number;
    chgPct: number;
    ext: number;
  }[] = [];

  ngOnInit() {
    this.updateWatchlistData();
    interval(1000000).subscribe(() => this.updateWatchlistData());
  }

  addNewSymbol() {
    const symbol = this.newSymbol.trim().toUpperCase();
    if (symbol && !this.symbols.find((s) => s.symbol === symbol)) {
      // this.symbols.push({ symbol, last: 0, chg: 0, chgPct: 0, ext: 0 });
      this.addToDB.emit(symbol);
      this.newSymbol = '';
    }
  }

  remove(index: number) {
    this.removeFromDB.emit(this.symbols[index].symbol);
    this.symbols.splice(index, 1);
  }

  updateWatchlistData() {
    const requests = this.symbols.map((item: { symbol: string }) =>
      this.stockData.getTimeSeries(item.symbol, '1day', '2')
    );

    forkJoin(requests).subscribe((results: any[]) => {
      results.forEach((data, i) => {
        if (data && data.values && data.values.length > 1) {
          const latest = data.values[0];
          const prev = data.values[1];
          const last = parseFloat(latest.close);
          const prevClose = parseFloat(prev.close);
          const chg = last - prevClose;
          const chgPct = (chg / prevClose) * 100;
          const ext = parseFloat(latest.extendedHours || 0);

          this.symbols[i].last = parseFloat(last.toFixed(2));
          this.symbols[i].chg = parseFloat(chg.toFixed(2));
          this.symbols[i].chgPct = parseFloat(chgPct.toFixed(2));
          this.symbols[i].ext = parseFloat(ext.toFixed(2));
        }
      });
    });
  }
}
