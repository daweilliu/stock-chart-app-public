import { Injectable } from '@angular/core';
import { VertLine } from '../plugins/vertical-line';

@Injectable({
  providedIn: 'root',
})
export class TrueVerticalLineService {
  private currentLines: VertLine[] = [];

  createVerticalLines(
    chart: any,
    series: any,
    times: (string | number)[]
  ): Promise<VertLine[]> {
    // Clear existing lines first
    this.clearVerticalLines(series);

    const newLines: VertLine[] = [];

    times.forEach((time, index) => {
      // Create vertical line using the plugin with thin, distinct styling
      const verticalLine = new VertLine(chart, series, time as any, {
        color: 'rgba(255, 140, 0, 0.8)', // Dark orange - distinct from blue markers
        width: 1, // Thin line for elegant appearance
        lineStyle: 'dashed',
        showLabel: false,
      });

      // Add the vertical line to the series
      series.attachPrimitive(verticalLine);
      newLines.push(verticalLine);
    });

    this.currentLines = newLines;
    return Promise.resolve(newLines);
  }

  clearVerticalLines(series?: any) {
    if (series && this.currentLines.length > 0) {
      this.currentLines.forEach((line) => {
        try {
          series.detachPrimitive(line);
        } catch (error) {
          console.warn('Warning: Could not detach vertical line:', error);
        }
      });
    }

    this.currentLines = [];
  }

  getCurrentVerticalLines() {
    return this.currentLines;
  }
}
