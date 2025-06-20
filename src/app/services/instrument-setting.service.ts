import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InstrumentSettingService {
  private apiUrl = 'http://localhost:3000/api/instrument-setting';

  constructor(private http: HttpClient) {}

  saveSetting(payload: {
    userId: string;
    layout: string;
    symbol: string;
    settingType: string;
    value: any;
  }): Observable<any> {
    return this.http.post(this.apiUrl, payload);
  }

  getSetting(
    userId: string,
    layout: string,
    symbol: string,
    settingType: string
  ): Observable<any> {
    return this.http.get(
      `${this.apiUrl}/${userId}/${layout}/${symbol}/${settingType}`
    );
  }

  deleteSetting(
    userId: string,
    layout: string,
    symbol: string,
    settingType: string
  ): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${userId}/${layout}/${symbol}/${settingType}`
    );
  }
}
