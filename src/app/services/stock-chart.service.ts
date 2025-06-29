import { Injectable } from '@angular/core';
import {
  createChart,
  IChartApi,
  CandlestickData,
  LineData,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
} from 'lightweight-charts';

@Injectable({ providedIn: 'root' })
export class StockChartService {
  chart!: IChartApi;
  candleSeries: any;
  volumeSeries: any;

  initChart(container: HTMLElement): IChartApi {
    this.chart = createChart(container, {
      width: container.offsetWidth,
      height: container.offsetHeight,
      rightPriceScale: { visible: false },
      timeScale: { borderColor: '#71649C', visible: true, rightOffset: 2 }, // Right margin (in bars)
      layout: { background: { color: '#181922' }, textColor: '#cccccc' },
      grid: {
        vertLines: { color: '#22232a' },
        horzLines: { color: ' }#22232a' },
      },
      leftPriceScale: { visible: true, borderColor: '#555' },
    });

    this.candleSeries = this.chart.addSeries(CandlestickSeries, {
      // options for the candlestick series
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
    return this.chart;
  }

  setCandleData(data: CandlestickData[]) {
    this.candleSeries.setData(data);
  }

  setVolumeData(volumeData: any[]) {
    this.volumeSeries.setData(volumeData);
  }

  addSmaLine(data: CandlestickData[], period: number, color: string) {
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

  // Add marker and other chart logic as needed
}
