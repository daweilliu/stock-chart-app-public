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

export function buildDLSeqMarkers(
  data: CandlestickData[],
  startIndex: number,
  startMode: 'up' | 'down' = 'up'
): any[] {
  const markers: any[] = [];
  let mode: 'up' | 'down' = startMode;
  let count = 1;

  for (let i = startIndex; i < data.length; i++) {
    markers.push({
      time: data[i].time,
      position: mode === 'up' ? 'aboveBar' : 'belowBar',
      color: mode === 'up' ? 'yellow' : 'cyan',
      text: String(count),
      size: count === 9 ? 2 : 1,
      fontWeight: count === 9 ? 'bold' : undefined,
    });

    if (count === 9) {
      // Add 9 marker (already added above), now immediately add "1" marker on the same bar (overlap)
      // Flip mode for next marker
      const nextMode = mode === 'up' ? 'down' : 'up';
      markers.push({
        time: data[i].time,
        position: nextMode === 'up' ? 'aboveBar' : 'belowBar',
        color: nextMode === 'up' ? 'yellow' : 'cyan',
        text: '1',
        size: 1,
      });
      mode = nextMode;
      count = 2; // because "1" is already displayed at this bar
    } else {
      count++;
    }
  }
  return markers;
}
