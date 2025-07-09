import { Injectable } from '@angular/core';
import {
  createChart,
  IChartApi,
  CandlestickData,
  LineData,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createSeriesMarkers,
  ISeriesMarkersPluginApi,
} from 'lightweight-charts';

@Injectable({ providedIn: 'root' })
export class StockChartService {
  chart!: IChartApi;
  candleSeries: any;
  volumeSeries: any;
  private currentVerticalLines: any[] = []; // Track current vertical lines
  private isDisposed = false; // Flag to track if chart is disposed
  private smaSeries: any[] = []; // Track SMA series for cleanup

  // ---- NEW: Separate marker tracking for different types ----
  private dMarkMarkers: any[] = []; // Track D-Mark markers
  private dlSeq9Markers: any[] = []; // Track DL-Seq-9 markers

  // ---- NEW: Generic Markers API handle ----
  markersApi?: ISeriesMarkersPluginApi<any>;

  initChart(container: HTMLElement): IChartApi {
    // Clean up any existing chart first
    this.destroyChart();

    this.isDisposed = false;
    this.chart = createChart(container, {
      width: container.offsetWidth,
      height: container.offsetHeight,
      rightPriceScale: { visible: false },
      timeScale: { borderColor: '#71649C', visible: true, rightOffset: 2 }, // Right margin (in bars)
      layout: { background: { color: '#181922' }, textColor: '#cccccc' },
      grid: {
        vertLines: { color: '#22232a' },
        horzLines: { color: '#22232a' },
      },
      leftPriceScale: { visible: true, borderColor: '#555' },
    });

    this.candleSeries = this.chart.addSeries(CandlestickSeries, {
      priceScaleId: 'left',
      upColor: '#00ff00',
      downColor: '#ff0000',
      borderUpColor: '#00ff00',
      borderDownColor: '#ff0000',
      wickUpColor: '#00ff00',
      wickDownColor: '#ff0000',
    });

    this.volumeSeries = this.chart.addSeries(HistogramSeries, {
      color: '#888888',
      priceFormat: { type: 'volume', precision: 0, minMove: 1 },
      priceScaleId: 'volume', // Assign a price scale ID
    });

    // Set the scaleMargins on the price scale associated with the volume series
    this.volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    // ---- NEW: Initialize the marker plugin ONCE here ----
    this.initMarkersPlugin();

    return this.chart;
  }

  // ---- NEW: Initialize Markers Plugin ONCE after series is created ----
  initMarkersPlugin() {
    if (!this.markersApi && this.candleSeries && !this.isDisposed) {
      this.markersApi = createSeriesMarkers(this.candleSeries, []);
    }
  }

  // ---- NEW: Set or clear markers ----
  setMarkers(markers: any[]) {
    if (this.markersApi && !this.isDisposed) {
      this.markersApi.setMarkers(markers);
    }
  }

  // ---- NEW: Manage D-Mark markers separately ----
  setDMarkMarkers(markers: any[]) {
    this.dMarkMarkers = markers;
    this.updateCombinedMarkers();
  }

  clearDMarkMarkers() {
    this.dMarkMarkers = [];
    this.updateCombinedMarkers();
  }

  // ---- NEW: Manage DL-Seq-9 markers separately ----
  setDLSeq9Markers(markers: any[]) {
    this.dlSeq9Markers = markers;
    this.updateCombinedMarkers();
  }

  clearDLSeq9Markers() {
    this.dlSeq9Markers = [];
    this.updateCombinedMarkers();
  }

  // ---- NEW: Combine and update all markers ----
  private updateCombinedMarkers() {
    const allMarkers = [...this.dMarkMarkers, ...this.dlSeq9Markers];
    // Sort by time to ensure proper display order
    allMarkers.sort((a: any, b: any) =>
      typeof a.time === 'number' && typeof b.time === 'number'
        ? a.time - b.time
        : new Date(a.time as any).getTime() - new Date(b.time as any).getTime()
    );
    this.setMarkers(allMarkers);
  }

  clearMarkers() {
    if (!this.isDisposed) {
      this.setMarkers([]);
    }
  }

  setCandleData(data: CandlestickData[]) {
    if (this.candleSeries && !this.isDisposed) {
      this.candleSeries.setData(data);
    }
  }

  setVolumeData(volumeData: any[]) {
    if (this.volumeSeries && !this.isDisposed) {
      this.volumeSeries.setData(volumeData);
    }
  }

  clearSmaSeries() {
    if (!this.isDisposed && this.chart) {
      // Remove all existing SMA series
      this.smaSeries.forEach((series) => {
        try {
          this.chart.removeSeries(series);
        } catch (error) {
          console.warn('Error removing SMA series:', error);
        }
      });
      this.smaSeries = [];
    }
  }

  addSmaLine(data: CandlestickData[], period: number, color: string) {
    if (this.isDisposed || !this.chart) return null;

    const smaData = this.calculateSMA(data, period);

    const smaSeries = this.chart.addSeries(LineSeries, {
      color,
      lineWidth: 2,
      priceLineVisible: false,
    });
    smaSeries.setData(smaData);

    // ---- NEW: Track the created SMA series for cleanup ----
    this.smaSeries.push(smaSeries);
    return smaSeries;
  }

  calculateSMA(data: CandlestickData[], period: number): LineData[] {
    const result: LineData[] = [];
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const avg = slice.reduce((sum, bar) => sum + bar.close, 0) / period;
      result.push({ time: data[i].time, value: parseFloat(avg.toFixed(2)) });
    }
    return result;
  }

  // Vertical line management methods
  addVerticalLines(verticalLines: any[]) {
    this.currentVerticalLines = verticalLines;
  }

  clearVerticalLines() {
    this.currentVerticalLines = [];
  }

  getCurrentVerticalLines() {
    return this.currentVerticalLines;
  }

  isChartValid(): boolean {
    return !this.isDisposed && !!this.chart;
  }

  destroyChart() {
    if (this.isDisposed) {
      return; // Already disposed, don't try again
    }

    // Set disposed flag first to prevent any new operations
    this.isDisposed = true;

    // Clear all series and references first
    this.markersApi = undefined;
    this.currentVerticalLines = [];
    this.smaSeries = [];
    this.dMarkMarkers = [];
    this.dlSeq9Markers = [];
    this.candleSeries = undefined!;
    this.volumeSeries = undefined!;

    // Try to remove the chart last
    if (this.chart) {
      try {
        this.chart.remove();
      } catch (error) {
        // Suppress the error to prevent it from bubbling up
        console.warn(
          'Chart removal warning (suppressed):',
          error instanceof Error ? error.message : String(error)
        );
      }
      this.chart = undefined!;
    }
  }
}
