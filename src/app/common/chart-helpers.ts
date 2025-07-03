import { EventEmitter } from '@angular/core';
import {
  buildDLSeqMarkers,
  buildDMarkMarkers_TD13,
  getTD9CompletionTimes,
} from '../common/marker-helpers';
import { StockChartService } from '../services/stock-chart.service';
import { StockDataService } from '../services/stock-data.service';
import { VerticalLinePluginService } from '../services/vertical-line-plugin.service';
import { TrueVerticalLineService } from '../services/true-vertical-line.service';
import {
  CandlestickData,
  createSeriesMarkers,
  LineSeries,
  ISeriesApi,
  HistogramSeries,
} from 'lightweight-charts';

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
  showDlSeq9: boolean,
  showVolumeOverlap: boolean,
  chartService: StockChartService,
  dataService: StockDataService,
  latestBar: EventEmitter<any>,
  barClicked: EventEmitter<any>,
  dlSeq9Click?: EventEmitter<{ time: string | number; isShowing: boolean }>,
  verticalLineService?: VerticalLinePluginService,
  trueVerticalLineService?: TrueVerticalLineService
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

      const minPrice = Math.min(...data.map((d: any) => d.low));
      const maxPrice = Math.max(...data.map((d: any) => d.high));

      // Remove the old histogram-based vertical line series
      // const verticalLineSeries = chartService.chart.addSeries(HistogramSeries, {
      //   color: 'lightblue',
      //   priceScaleId: 'right',
      //   baseLineColor: 'lightblue',
      // });

      const volumeData = reversedValues.map((bar: any) => ({
        time: bar.datetime,
        value: parseFloat(bar.volume),
        color:
          parseFloat(bar.close) >= parseFloat(bar.open) ? '#1aff1a' : '#ff3333',
      }));

      chartService.setCandleData(data);

      const swingBars = 3;

      chartService.chart.subscribeClick((param: any) => {
        if (!param || !param.time) {
          return;
        }

        const clickedTime = param.time;
        let isDLSeq9Showing = progressDLSeq9(
          data,
          clickedTime,
          showDlSeq9,
          chartService,
          swingBars,
          verticalLineService,
          trueVerticalLineService
        );

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

      // D-Mark markers - clear all existing markers first
      const markers = buildDMarkMarkers_TD13(data);
      markers.sort((a: any, b: any) =>
        typeof a.time === 'number' && typeof b.time === 'number'
          ? a.time - b.time
          : new Date(a.time as any).getTime() -
            new Date(b.time as any).getTime()
      );
      if (chartService.candleSeries) {
        // Clear all existing markers (including DL Sequence markers)
        clearChartMarkers(chartService.candleSeries);
        // Then set D-Mark markers if enabled
        if (showDMark) {
          createSeriesMarkers(chartService.candleSeries, markers);
        }
      }

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

export function progressDLSeq9(
  data: any[],
  clickedTime: string | number,
  showDlSeq9: boolean,
  chartService: StockChartService,
  swingBars: number,
  verticalLineService?: VerticalLinePluginService,
  trueVerticalLineService?: TrueVerticalLineService
): boolean {
  let isDLSeq9Showing = false;
  const minPrice = Math.min(...data.map((d) => d.low));
  const maxPrice = Math.max(...data.map((d) => d.high));
  let specialAllNines: { time: string | number; value: number }[] = [];

  const clickedIndex = data.findIndex((d: any) => d.time === clickedTime);

  if (clickedIndex === -1) {
    return false;
  }

  if (!showDlSeq9) {
    return false;
  }

  if (isSwingLow(data, clickedIndex, swingBars)) {
    const { markers, specialNines } = buildDLSeqMarkers(
      data,
      clickedIndex,
      'up'
    );
    if (chartService.candleSeries) {
      // Clear all existing markers before adding DL Sequence markers
      clearChartMarkers(chartService.candleSeries);
      // Add only DL Sequence markers
      createSeriesMarkers(chartService.candleSeries, markers);
      isDLSeq9Showing = markers.length > 0;
      specialAllNines = specialNines;
    }
  } else if (isSwingHigh(data, clickedIndex, swingBars)) {
    const { markers, specialNines } = buildDLSeqMarkers(
      data,
      clickedIndex,
      'down'
    );
    if (chartService.candleSeries) {
      // Clear all existing markers before adding DL Sequence markers
      clearChartMarkers(chartService.candleSeries);
      // Add only DL Sequence markers
      createSeriesMarkers(chartService.candleSeries, markers);
      isDLSeq9Showing = markers.length > 0;
      specialAllNines = specialNines;
    }
  } else {
    // Clicked point is neither swing low nor swing high
  }

  // Only use DL Sequence "9"s - no TD9 fallback
  if (specialAllNines.length === 0) {
    return isDLSeq9Showing;
  }

  // Create TRUE vertical lines using the new service
  if (trueVerticalLineService && specialAllNines.length > 0) {
    const uniqueTimes = Array.from(
      new Set(specialAllNines.map((nine) => nine.time))
    ).sort((a, b) => {
      const ta = typeof a === 'string' ? Date.parse(a) : Number(a);
      const tb = typeof b === 'string' ? Date.parse(b) : Number(b);
      return ta - tb;
    });

    // Clear any existing vertical lines before creating new ones
    trueVerticalLineService.clearVerticalLines(chartService.candleSeries);

    // Use the TRUE vertical line service to create actual vertical lines
    trueVerticalLineService
      .createVerticalLines(
        chartService.chart,
        chartService.candleSeries,
        uniqueTimes
      )
      .then((lines) => {
        // Lines created successfully
      })
      .catch((error) => {
        console.error('❌ Failed to create TRUE vertical lines:', error);
      });
  }
  // Fallback to plugin-based approach if true vertical lines fail
  else if (verticalLineService && specialAllNines.length > 0) {
    const uniqueTimes = Array.from(
      new Set(specialAllNines.map((nine) => nine.time))
    ).sort((a, b) => {
      const ta = typeof a === 'string' ? Date.parse(a) : Number(a);
      const tb = typeof b === 'string' ? Date.parse(b) : Number(b);
      return ta - tb;
    });

    // Use the vertical line plugin to create beautiful vertical lines
    verticalLineService
      .createVerticalLines(
        chartService.chart,
        chartService.candleSeries,
        uniqueTimes
      )
      .then((lines) => {
        // Lines created successfully
      })
      .catch((error) => {
        console.error('❌ Failed to create vertical lines with plugin:', error);

        // Fallback: Create simple markers for vertical lines with dashed pattern
        const verticalMarkers = uniqueTimes.map((time) => ({
          time: time,
          position: 'inBar' as const,
          color: 'rgba(255, 255, 255, 0.9)', // White color to match other vertical lines
          shape: 'circle' as const,
          text: '¦', // Use broken bar character to simulate dashed line
          size: 2,
        }));

        // Add fallback markers to existing markers
        if (chartService.candleSeries) {
          const existingMarkers: any[] = [];
          const allMarkers = [...existingMarkers, ...verticalMarkers];
          createSeriesMarkers(chartService.candleSeries, allMarkers);
        }
      });
  }

  return isDLSeq9Showing;
}

// Utility function to clear all markers from a chart series
export function clearChartMarkers(candleSeries: any) {
  if (candleSeries) {
    createSeriesMarkers(candleSeries, []);
  }
}
