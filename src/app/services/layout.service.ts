import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Save a layout (create or update)
  saveLayout(
    userId: string,
    layoutName: string,
    layout: {
      timeframe: string;
      showDMark: boolean;
      showVolumeOverlap: boolean;
    }
  ) {
    return this.http.post(`${this.apiUrl}/layout`, {
      userId,
      layoutName,
      ...layout,
    });
  }

  // Load a specific layout
  loadLayout(userId: string, layoutName: string) {
    return this.http.get<any>(`${this.apiUrl}/layout/${userId}/${layoutName}`);
  }

  // List all layouts for a user
  listLayouts(userId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/layouts/${userId}`);
  }
}
