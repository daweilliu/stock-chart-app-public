import { EventEmitter } from '@angular/core';
import { buildDMarkMarkers, buildDLSeqMarkers } from '../common/marker-helpers';
import { StockChartService } from '../services/stock-chart.service';
import { StockDataService } from '../services/stock-data.service';

export const dlSeq9Click$ = new EventEmitter<{
  time: string | number;
  isShowing: boolean;
}>();

export function getOutputSize(range: string): string {
  switch (range) {
    case '1y':
      return '365';
    case '2y':
      return '730';
    case '5y':
      return '1500';
    case '10y':
      return '3000';
    case 'max':
      return '5000';
    default:
      return '30';
  }
}

export function getInterval(timeframe: 'daily' | 'weekly' | 'monthly'): string {
  switch (timeframe) {
    case 'daily':
      return '1day';
    case 'weekly':
      return '1week';
    case 'monthly':
      return '1month';
    default:
      return '1day';
  }
}

export function loadSymbolDataExternal(
  symbol: string,
  range: string,
  timeframe: 'daily' | 'weekly' | 'monthly',
  showSma: boolean,
  showSma1: boolean,
  sma1Period: number,
  showSma2: boolean,
  sma2Period: number,
  showSma3: boolean,
  sma3Period: number,
  showSma4: boolean,
  sma4Period: number,
  showSma5: boolean,
  sma5Period: number,
  showDMark: boolean,
  showVolumeOverlap: boolean,
  chartService: StockChartService,
  dataService: StockDataService,
  latestBar: EventEmitter<any>,
  barClicked: EventEmitter<any>,
  dlSeq9Click?: EventEmitter<{ time: string | number; isShowing: boolean }>
) {
  const outputsize = getOutputSize(range);
  const interval = getInterval(timeframe);

  dataService
    .getTimeSeries(symbol, interval, outputsize)
    .subscribe((res: any) => {
      if (!res.values || !Array.isArray(res.values)) {
        console.warn(`No data received for symbol: ${symbol} : ${res.message}`);
        return;
      }
      const reversedValues = res.values.reverse();
      const data = reversedValues.map((bar: any) => ({
        time: bar.datetime.slice(0, 10),
        open: parseFloat(bar.open),
        high: parseFloat(bar.high),
        low: parseFloat(bar.low),
        close: parseFloat(bar.close),
      }));

      if (data.length > 0) {
        const lastBar = data[data.length - 1];
        latestBar.emit({
          open: lastBar.open,
          high: lastBar.high,
          low: lastBar.low,
          close: lastBar.close,
        });
      }

      const volumeData = reversedValues.map((bar: any) => ({
        time: bar.datetime,
        value: parseFloat(bar.volume),
        color:
          parseFloat(bar.close) >= parseFloat(bar.open) ? '#1aff1a' : '#ff3333',
      }));

      chartService.setCandleData(data);

      chartService.chart.subscribeClick((param: any) => {
        if (!param || !param.time) return;

        const clickedTime = param.time;
        let isDLSeq9Showing = false;
        const clickedIndex = data.findIndex((d: any) => d.time === clickedTime);
        if (clickedIndex === -1) return;

        // Check if user picked a swing low or swing high
        if (isSwingLow(data, clickedIndex, swingBars)) {
          // Start up count from here
          const markers = buildDLSeqMarkers(data, clickedIndex, 'up');
          if (chartService.candleSeries) {
            chartService.candleSeries.setMarkers(markers);
            isDLSeq9Showing = markers.length > 0;
          }
        } else if (isSwingHigh(data, clickedIndex, swingBars)) {
          // Start down count from here
          const markers = buildDLSeqMarkers(data, clickedIndex, 'down');
          if (chartService.candleSeries) {
            chartService.candleSeries.setMarkers(markers);
            isDLSeq9Showing = markers.length > 0;
          }
        } else {
          // Not a swing low or swing high: do nothing or clear markers
          // flipFlopSeries.setMarkers([]);
        }
        // Emit to parent if EventEmitter provided
        if (dlSeq9Click && isDLSeq9Showing) {
          dlSeq9Click.emit({ time: clickedTime, isShowing: isDLSeq9Showing });
        }
      });

      if (chartService.candleSeries && chartService.chart) {
        chartService.chart.subscribeCrosshairMove((param: any) => {
          if (param && param.seriesData && param.seriesData.size > 0) {
            const priceData = Array.from(param.seriesData.values())[0];
            const bar = priceData as {
              open: number;
              high: number;
              low: number;
              close: number;
            };
            if (bar && bar.open !== undefined) {
              barClicked.emit({
                open: bar.open,
                high: bar.high,
                low: bar.low,
                close: bar.close,
              });
            }
          }
        });
      }

      if (showVolumeOverlap) chartService.setVolumeData(volumeData);

      if (showSma) {
        if (showSma1) chartService.addSmaLine(data, sma1Period, 'lightblue');
        if (showSma2) chartService.addSmaLine(data, sma2Period, 'orange');
        if (showSma3) chartService.addSmaLine(data, sma3Period, 'green');
        if (showSma4) chartService.addSmaLine(data, sma4Period, 'red');
        if (showSma5) chartService.addSmaLine(data, sma5Period, 'purple');
      }

      // D-Mark markers
      const markers = buildDMarkMarkers(data);
      if (chartService.candleSeries) {
        chartService.candleSeries.setMarkers(showDMark ? markers : []);
      }

      const swingBars = 3;
      // const flipFlopMarkers = buildFlipFlopMarkers(data, swingBars);
      // if (chartService.candleSeries) {
      //   chartService.candleSeries.setMarkers(flipFlopMarkers);
      // }
    });
}

function isSwingLow(data: any[], idx: number, swingBars: number): boolean {
  const curr = data[idx].low;
  for (let i = 1; i <= swingBars; i++) {
    if (
      idx - i < 0 ||
      idx + i >= data.length ||
      data[idx - i].low <= curr ||
      data[idx + i].low <= curr
    ) {
      return false;
    }
  }
  return true;
}

function isSwingHigh(data: any[], idx: number, swingBars: number): boolean {
  const curr = data[idx].high;
  for (let i = 1; i <= swingBars; i++) {
    if (
      idx - i < 0 ||
      idx + i >= data.length ||
      data[idx - i].high >= curr ||
      data[idx + i].high >= curr
    ) {
      return false;
    }
  }
  return true;
}
