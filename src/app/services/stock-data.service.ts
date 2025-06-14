import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StockDataService {
  //private apiKey = '660eb09d9dbb4c20a9a8ac1160837d22';
  private apiKey = 'cb3cb4c6c14c42b4943e7f0d1bfc5eb3';
  //cb3cb4c6c14c42b4943e7f0d1bfc5eb3 yinghualli

  constructor(private http: HttpClient) {}

  getTimeSeries(
    symbol: string,
    interval: string,
    outputsize: string
  ): Observable<any> {
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${this.apiKey}&format=JSON`;
    return this.http.get(url);
  }

  searchSymbol(symbol: string): Observable<any> {
    const url = `https://api.twelvedata.com/symbol_search?symbol=${symbol}&apikey=${this.apiKey}`;
    return this.http.get(url);
  }
}
