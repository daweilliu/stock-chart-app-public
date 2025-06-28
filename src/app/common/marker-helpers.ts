import { CandlestickData } from 'lightweight-charts';

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

export function buildDMarkMarkers_TD13(data: CandlestickData[]): any[] {
  const markers: any[] = [];
  let bull: any[] = [];
  let bear: any[] = [];
  let buySet = 0;
  let sellSet = 0;

  let buyCounCC = 0;
  let sellCounCC = 0;

  let buyCounCC8Close = 0;
  let sellCounCC8Close = 0;

  let highTrendLine = 0;
  let lowTrendLine = 0;

  // For PineScript's [1] and [2] historical referencing
  let prevBuyCounCC = 0,
    prevSellCounCC = 0;
  let prevBuyCounCC8Close = 0,
    prevSellCounCC8Close = 0;
  let prevHighTrendLine = 0,
    prevLowTrendLine = 0;

  let lastBullIdx = -1;
  let lastBearIdx = -1;

  // Now start from i = 5, since we reference i-5
  for (let i = 5; i < data.length; i++) {
    const close = data[i].close;
    const high = data[i].high;
    const low = data[i].low;
    const close4 = data[i - 4].close;
    const close5 = data[i - 5].close;
    const closePrev = data[i - 1].close;
    const close2 = data[i - 2]?.close;
    const high2 = data[i - 2]?.high;
    const low2 = data[i - 2]?.low;

    // --- SELL TD9 (uptrend, bearish reversal) ---
    if (
      close > close4 && // a) today > 4 bars ago
      closePrev <= close5 // b) yesterday <= 5 bars ago
    ) {
      sellSet = 1;
      bear = [
        {
          time: data[i].time,
          position: 'aboveBar',
          color: 'lightblue',
          text: '1',
        },
      ];
      lastBearIdx = i;
    } else if (close > close4 && sellSet > 0 && sellSet < 9) {
      sellSet++;
      bear.push({
        time: data[i].time,
        position: 'aboveBar',
        color: sellSet === 9 ? 'deeppink' : 'deepskyblue',
        text: `${sellSet}`,
        fontWeight: sellSet === 9 ? 'bold' : undefined,
        fontSize: sellSet === 9 ? 18 : undefined,
      });
      lastBearIdx = i;
      if (sellSet === 9) {
        markers.push(...bear);
        bear = [];
        lastBearIdx = -1;
      }
    } else {
      sellSet = 0;
      bear = [];
      lastBearIdx = -1;
    }

    // --- BUY TD9 (downtrend, bullish reversal) ---
    if (
      close < close4 && // a) today < 4 bars ago
      closePrev >= close5 // b) yesterday >= 5 bars ago
    ) {
      buySet = 1;
      bull = [
        {
          time: data[i].time,
          position: 'belowBar',
          color: 'lightblue',
          text: '1',
        },
      ];
      lastBullIdx = i;
    } else if (close < close4 && buySet > 0 && buySet < 9) {
      buySet++;
      bull.push({
        time: data[i].time,
        position: 'belowBar',
        color: buySet === 9 ? 'deeppink' : 'deepskyblue',
        text: `${buySet}`,
        fontWeight: buySet === 9 ? 'bold' : undefined,
        fontSize: buySet === 9 ? 18 : undefined,
      });
      lastBullIdx = i;
      if (buySet === 9) {
        markers.push(...bull);
        bull = [];
        lastBullIdx = -1;
      }
    } else {
      buySet = 0;
      bull = [];
      lastBullIdx = -1;
    }

    // --- TD13 COUNTDOWN LOGIC (unchanged) ---
    const highest9 = Math.max(
      ...data.slice(Math.max(0, i - 8), i + 1).map((d) => d.high)
    );
    highTrendLine =
      buySet === 9
        ? highest9
        : close > prevHighTrendLine
        ? 0
        : prevHighTrendLine;

    const lowest9 = Math.min(
      ...data.slice(Math.max(0, i - 8), i + 1).map((d) => d.low)
    );
    lowTrendLine =
      sellSet === 9 ? lowest9 : close < prevLowTrendLine ? 0 : prevLowTrendLine;

    // Buy Countdown
    const isBuyCounCC = close2 !== undefined && close < close2;
    const nonQBuy13 =
      isBuyCounCC &&
      Math.abs(prevBuyCounCC) === 12 &&
      low > prevBuyCounCC8Close;

    if (buySet === 9) {
      buyCounCC = isBuyCounCC ? 1 : 0;
    } else if (sellSet === 9 || highTrendLine === 0) {
      buyCounCC = 14;
    } else if (nonQBuy13) {
      buyCounCC = -12;
    } else if (isBuyCounCC) {
      buyCounCC = Math.abs(prevBuyCounCC) + 1;
    } else {
      buyCounCC = -Math.abs(prevBuyCounCC);
    }

    buyCounCC8Close = buyCounCC === 8 ? close : prevBuyCounCC8Close;

    // Sell Countdown
    const isSellCounCC = close2 !== undefined && close > close2;
    const nonQSell13 =
      isSellCounCC &&
      Math.abs(prevSellCounCC) === 12 &&
      high < prevSellCounCC8Close;

    if (sellSet === 9) {
      sellCounCC = isSellCounCC ? 1 : 0;
    } else if (buySet === 9 || lowTrendLine === 0) {
      sellCounCC = 14;
    } else if (nonQSell13) {
      sellCounCC = -12;
    } else if (isSellCounCC) {
      sellCounCC = Math.abs(prevSellCounCC) + 1;
    } else {
      sellCounCC = -Math.abs(prevSellCounCC);
    }

    sellCounCC8Close = sellCounCC === 8 ? close : prevSellCounCC8Close;

    // --- TD13 Markers ---
    if (buyCounCC > 0 && buyCounCC <= 13) {
      markers.push({
        time: data[i].time,
        position: 'belowBar',
        color: buyCounCC === 13 ? 'red' : 'lightYellow',
        text: `${buyCounCC}`,
        fontWeight: buyCounCC === 13 ? 'bold' : undefined,
        fontSize: buyCounCC === 13 ? 18 : undefined,
      });
    }
    if (sellCounCC > 0 && sellCounCC <= 13) {
      markers.push({
        time: data[i].time,
        position: 'aboveBar',
        color: sellCounCC === 13 ? 'red' : 'lightYellow',
        text: `${sellCounCC}`,
        fontWeight: sellCounCC === 13 ? 'bold' : undefined,
        fontSize: sellCounCC === 13 ? 18 : undefined,
      });
    }

    // --- Prepare previous state for next iteration ---
    prevBuyCounCC = buyCounCC;
    prevSellCounCC = sellCounCC;
    prevBuyCounCC8Close = buyCounCC8Close;
    prevSellCounCC8Close = sellCounCC8Close;
    prevHighTrendLine = highTrendLine;
    prevLowTrendLine = lowTrendLine;
  }

  // ---- FINAL: Show incomplete active TD9 at right edge (if any) ----
  // Only show if it's the last incomplete one at the most recent bars

  if (bull.length > 0 && bull.length < 9 && lastBullIdx === data.length - 1) {
    markers.push(...bull);
  }
  if (bear.length > 0 && bear.length < 9 && lastBearIdx === data.length - 1) {
    markers.push(...bear);
  }

  // === 3rd Marker: New High/Low Streak after any TD9 completes, stops at next TD9 ===
  // === 3rd Marker: New High/Low Streak after any TD9 completes, show only 3, 6, 9 ===

  // Step 1: Collect all TD9 completions
  const streakStarts: { idx: number; type: 'high' | 'low' }[] = [];
  let buySetTemp = 0,
    sellSetTemp = 0;

  for (let i = 5; i < data.length; i++) {
    const close = data[i].close;
    const close4 = data[i - 4].close;
    const close5 = data[i - 5].close;
    const closePrev = data[i - 1].close;

    // -- SELL TD9 detect
    if (close > close4 && closePrev <= close5) {
      sellSetTemp = 1;
    } else if (close > close4 && sellSetTemp > 0 && sellSetTemp < 9) {
      sellSetTemp++;
      if (sellSetTemp === 9) {
        streakStarts.push({ idx: i, type: 'high' });
      }
    } else {
      sellSetTemp = 0;
    }

    // -- BUY TD9 detect
    if (close < close4 && closePrev >= close5) {
      buySetTemp = 1;
    } else if (close < close4 && buySetTemp > 0 && buySetTemp < 9) {
      buySetTemp++;
      if (buySetTemp === 9) {
        streakStarts.push({ idx: i, type: 'low' });
      }
    } else {
      buySetTemp = 0;
    }
  }

  // Step 2: For each streak, count new highs/lows until next TD9
  for (let s = 0; s < streakStarts.length; s++) {
    const { idx, type } = streakStarts[s];
    let nextTD9Idx = data.length;
    if (s + 1 < streakStarts.length) {
      nextTD9Idx = streakStarts[s + 1].idx;
    }
    let streakCount = 0;
    let lastValue = type === 'high' ? data[idx].high : data[idx].low;

    for (let j = idx + 1; j < nextTD9Idx; j++) {
      if (type === 'high') {
        if (data[j].high > lastValue) {
          streakCount++;
          lastValue = data[j].high;
          if ([3, 6, 9].includes(streakCount)) {
            markers.push({
              time: data[j].time,
              position: 'aboveBar',
              color: 'orange',
              text: `${streakCount}`,
              fontSize: 16,
              fontWeight: 'bold',
            });
          }
        }
      } else if (type === 'low') {
        if (data[j].low < lastValue) {
          streakCount++;
          lastValue = data[j].low;
          if ([3, 6, 9].includes(streakCount)) {
            markers.push({
              time: data[j].time,
              position: 'belowBar',
              color: 'orange',
              text: `${streakCount}`,
              fontSize: 16,
              fontWeight: 'bold',
            });
          }
        }
      }
    }
  }

  return markers;
}
