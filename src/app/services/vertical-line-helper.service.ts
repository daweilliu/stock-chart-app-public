import { Injectable } from '@angular/core';
import { StockChartService } from './stock-chart.service';

@Injectable({
  providedIn: 'root',
})
export class VerticalLineHelperService {
  /**
   * Creates vertical lines using series markers as a fallback
   * This ensures vertical lines work even if the plugin fails
   */
  createVerticalLinesWithMarkers(
    chartService: StockChartService,
    times: (string | number)[],
    data: any[]
  ) {
    // Find the min and max prices for the vertical line height
    const minPrice = Math.min(...data.map((d: any) => d.low));
    const maxPrice = Math.max(...data.map((d: any) => d.high));
    const priceRange = maxPrice - minPrice;

    // Create markers that simulate vertical lines
    const verticalLineMarkers = times.map((time) => ({
      time: time,
      position: 'inBar' as const,
      color: 'rgba(255, 107, 107, 0.7)', // Semi-transparent red
      shape: 'arrowDown' as const,
      text: '│', // Vertical line character
      size: 3,
    }));

    // Add the markers to the candlestick series
    if (chartService.candleSeries) {
      const existingMarkers = chartService.candleSeries.markers() || [];
      const allMarkers = [...existingMarkers, ...verticalLineMarkers];
      chartService.candleSeries.setMarkers(allMarkers);
    }

    return verticalLineMarkers;
  }

  /**
   * Creates custom series for vertical lines
   */
  createVerticalLinesSeries(
    chartService: StockChartService,
    times: (string | number)[],
    data: any[]
  ) {
    const minPrice = Math.min(...data.map((d: any) => d.low)) * 0.95;
    const maxPrice = Math.max(...data.map((d: any) => d.high)) * 1.05;

    // Create a histogram series for each vertical line
    const verticalLineSeries: any[] = [];

    times.forEach((time, index) => {
      const histogramSeries = chartService.chart.addSeries('Histogram' as any, {
        color: '#ff6b6b',
        priceScaleId: 'left',
        priceLineVisible: false,
        lastValueVisible: false,
        title: `VLine_${index}`,
      });

      // Create a single bar at the specified time spanning the full height
      const verticalLineData = [
        {
          time: time,
          value: maxPrice - minPrice,
          color: 'rgba(255, 107, 107, 0.3)',
        },
      ];

      histogramSeries.setData(verticalLineData);
      verticalLineSeries.push(histogramSeries);
    });

    return verticalLineSeries;
  }

  /**
   * Remove vertical line series
   */
  removeVerticalLineSeries(chartService: StockChartService, series: any[]) {
    series.forEach((s) => {
      try {
        chartService.chart.removeSeries(s);
      } catch (error) {
        console.warn('Error removing vertical line series:', error);
      }
    });
  }
}
