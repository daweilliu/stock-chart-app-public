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

  addSmaLine(data: CandlestickData[], period: number, color: string) {
    if (this.isDisposed || !this.chart) return null;

    const smaData = this.calculateSMA(data, period);

    const smaSeries = this.chart.addSeries(LineSeries, {
      color,
      lineWidth: 2,
      priceLineVisible: false,
    });
    smaSeries.setData(smaData);
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
    if (this.chart && !this.isDisposed) {
      try {
        this.chart.remove();
      } catch (error) {
        console.warn('Error removing chart:', error);
      }
    }

    this.isDisposed = true;
    this.chart = undefined!;
    this.candleSeries = undefined!;
    this.volumeSeries = undefined!;
    this.markersApi = undefined;
    this.currentVerticalLines = [];
  }
}
