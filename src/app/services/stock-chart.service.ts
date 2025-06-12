import { Injectable } from '@angular/core';
import {
  createChart,
  IChartApi,
  CandlestickData,
  LineData,
} from 'lightweight-charts';

@Injectable({ providedIn: 'root' })
export class StockChartService {
  chart!: IChartApi;
  candleSeries: any;
  volumeSeries: any;

  initChart(container: HTMLElement): IChartApi {
    this.chart = createChart(container, {
      width: container.clientWidth,
      height: 750,
      layout: { background: { color: '#0F0F0F' }, textColor: '#fff' },
      grid: { vertLines: { color: '#111' }, horzLines: { color: '#111' } },
      rightPriceScale: { visible: false },
      leftPriceScale: { visible: true, borderColor: '#555' },
    });
    this.candleSeries = this.chart.addCandlestickSeries({
      priceScaleId: 'left',
      upColor: '#089981', // <-- up bar color (green)
      downColor: '#F23645', // <-- down bar color (red)
      borderUpColor: '#089981',
      borderDownColor: '#F23645',
      wickUpColor: '#089981',
      wickDownColor: '#F23645',
    });
    this.volumeSeries = this.chart.addHistogramSeries({
      color: '#888',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    this.chart.priceScale('volume').applyOptions({
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
    const smaSeries = this.chart.addLineSeries({ color, lineWidth: 2 });
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
