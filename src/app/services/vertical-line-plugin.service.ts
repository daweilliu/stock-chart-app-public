import { Injectable } from '@angular/core';

declare const window: any;

@Injectable({
  providedIn: 'root'
})
export class VerticalLinePluginService {
  private verticalLinePlugin: any = null;

  async loadVerticalLinePlugin(): Promise<any> {
    try {
      // Dynamic import of the vertical line plugin
      // @ts-ignore - Dynamic import of plugin
      const pluginModule = await import('/assets/plugins/vertical-line/vertical-line.js');
      return pluginModule.VerticalLine || pluginModule.default?.VerticalLine;
    } catch (error) {
      console.error('Failed to load vertical line plugin:', error);
      throw error;
    }
  }

  async createVerticalLines(chart: any, times: (string | number)[]): Promise<any[]> {
    if (!this.verticalLinePlugin) {
      const VerticalLineClass = await this.loadVerticalLinePlugin();
      this.verticalLinePlugin = VerticalLineClass;
    }

    const verticalLines: any[] = [];

    times.forEach(time => {
      const verticalLine = new this.verticalLinePlugin({
        time: time,
        color: '#ff6b6b', // Red color for vertical lines
        width: 2,
        style: 'solid', // or 'dashed', 'dotted'
        opacity: 0.7,
        showLabel: false,
      });

      chart.addPrimitive(verticalLine);
      verticalLines.push(verticalLine);
    });

    return verticalLines;
  }

  removeVerticalLines(chart: any, verticalLines: any[]) {
    verticalLines.forEach(line => {
      try {
        chart.removePrimitive(line);
      } catch (error) {
        console.warn('Error removing vertical line:', error);
      }
    });
  }
}
