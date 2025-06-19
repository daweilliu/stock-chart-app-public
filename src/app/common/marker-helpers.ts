import { CandlestickData } from 'lightweight-charts';

export function buildDMarkMarkers(data: CandlestickData[]): any[] {
  const markers: any[] = [];
  let bull: any[] = [];
  let bear: any[] = [];

  for (let i = 4; i < data.length; i++) {
    const close = data[i].close;
    const close4 = data[i - 4].close;

    if (close > close4) {
      bull.push({
        time: data[i].time,
        position: 'aboveBar',
        color: bull.length === 8 ? 'deeppink' : 'lightblue',
        text: `${bull.length + 1}`,
        fontWeight: bull.length === 8 ? 'bold' : undefined,
        fontSize: bull.length === 8 ? 20 : undefined,
      });
      bear = [];
      if (bull.length === 9) {
        markers.push(...bull);
        bull = [];
      }
    } else if (close < close4) {
      bear.push({
        time: data[i].time,
        position: 'belowBar',
        color: bear.length === 8 ? 'deeppink' : 'lightblue',
        text: `${bear.length + 1}`,
        fontWeight: bear.length === 8 ? 'bold' : undefined,
        fontSize: bear.length === 8 ? 20 : undefined,
      });
      bull = [];
      if (bear.length === 9) {
        markers.push(...bear);
        bear = [];
      }
    } else {
      bull = [];
      bear = [];
    }
  }
  markers.push(...bull, ...bear);
  return markers;
}

// Place this below buildDMarkMarkers in marker-helpers.ts

export function buildFlipFlopMarkers(
  data: CandlestickData[],
  swingBars = 1
): any[] {
  const markers: any[] = [];
  let mode: 'up' | 'down' = 'up';
  let count = 0;

  function isSwingLow(idx: number): boolean {
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

  function isSwingHigh(idx: number): boolean {
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

  for (let i = swingBars; i < data.length - swingBars; i++) {
    if (mode === 'up') {
      if (count === 0 && isSwingLow(i)) {
        count = 1;
        markers.push({
          time: data[i].time,
          position: 'aboveBar',
          color: 'yellow',
          text: '1',
          size: 1,
        });
      } else if (count > 0 && count < 9) {
        count++;
        markers.push({
          time: data[i].time,
          position: 'aboveBar',
          color: 'yellow',
          text: String(count),
          size: count === 9 ? 2 : 1,
          fontWeight: count === 9 ? 'bold' : undefined,
        });
        if (count === 9) {
          // At 9, overlay a new 1 below and switch
          markers.push({
            time: data[i].time,
            position: 'belowBar',
            color: 'cyan',
            text: '1',
            size: 1,
          });
          mode = 'down';
          count = 1; // start count for down sequence
        }
      }
    } else if (mode === 'down') {
      if (count > 0 && count < 9) {
        count++;
        markers.push({
          time: data[i].time,
          position: 'belowBar',
          color: 'cyan',
          text: String(count),
          size: count === 9 ? 2 : 1,
          fontWeight: count === 9 ? 'bold' : undefined,
        });
        if (count === 9) {
          // At 9, overlay a new 1 above and switch
          markers.push({
            time: data[i].time,
            position: 'aboveBar',
            color: 'yellow',
            text: '1',
            size: 1,
          });
          mode = 'up';
          count = 1;
        }
      }
    }
  }

  return markers;
}
