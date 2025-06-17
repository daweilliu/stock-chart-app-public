import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private apiUrl = 'http://localhost:3000/api/settings';

  constructor(private http: HttpClient) {}

  saveSettings(
    userId: string,
    layoutName: string,
    setting_detail: any
  ): Observable<any> {
    return this.http.post(this.apiUrl, { userId, layoutName, setting_detail });
  }

  loadSettings(userId: string, layoutName: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${userId}/${layoutName}`);
  }
}
