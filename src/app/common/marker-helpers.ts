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

export function buildDMarkMarkers02(data: CandlestickData[]): any[] {
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
  let prevBuySet = 0,
    prevSellSet = 0;
  let prevBuyCounCC = 0,
    prevSellCounCC = 0;
  let prevBuyCounCC8Close = 0,
    prevSellCounCC8Close = 0;
  let prevHighTrendLine = 0,
    prevLowTrendLine = 0;

  for (let i = 4; i < data.length; i++) {
    const close = data[i].close;
    const high = data[i].high;
    const low = data[i].low;
    const close4 = data[i - 4].close;
    const close2 = i >= 2 ? data[i - 2].close : undefined;
    const high2 = i >= 2 ? data[i - 2].high : undefined;
    const low2 = i >= 2 ? data[i - 2].low : undefined;

    // --- TD9 SETUP LOGIC (matching Pine Script) ---
    if (close > close4) {
      sellSet = prevSellSet === 9 ? 1 : prevSellSet + 1;
    } else {
      sellSet = 0;
      bear = [];
    }
    if (close < close4) {
      buySet = prevBuySet === 9 ? 1 : prevBuySet + 1;
    } else {
      buySet = 0;
      bull = [];
    }

    // --- TD9 Markers ---
    if (buySet > 0 && buySet <= 9) {
      bull.push({
        time: data[i].time,
        position: 'belowBar',
        color: buySet === 9 ? 'deeppink' : 'lightblue',
        text: `${buySet}`,
        fontWeight: buySet === 9 ? 'bold' : undefined,
        fontSize: buySet === 9 ? 18 : undefined,
      });
      if (buySet === 9) {
        // Insert bull items into markers
        markers.push(...bull);
        // Sort markers: by time, and if time is the same, bull items first
        markers.sort((a, b) => {
          const ta =
            typeof a.time === 'string' ? Date.parse(a.time) : Number(a.time);
          const tb =
            typeof b.time === 'string' ? Date.parse(b.time) : Number(b.time);
          if (ta !== tb) return ta - tb;
          // If times are equal, bull items (position: 'belowBar') come first
          if (a.position === 'belowBar' && b.position !== 'belowBar') return -1;
          if (a.position !== 'belowBar' && b.position === 'belowBar') return 1;
          return 0;
        });
        bull = [];
      }
    }
    if (sellSet > 0 && sellSet <= 9) {
      bear.push({
        time: data[i].time,
        position: 'aboveBar',
        color: sellSet === 9 ? 'deeppink' : 'lightblue',
        text: `${sellSet}`,
        fontWeight: sellSet === 9 ? 'bold' : undefined,
        fontSize: sellSet === 9 ? 18 : undefined,
      });
      if (sellSet === 9) {
        markers.push(...bear);
        // Sort markers: by time, and if time is the same, bear items (position: 'aboveBar') come after bull items
        markers.sort((a, b) => {
          const ta =
            typeof a.time === 'string' ? Date.parse(a.time) : Number(a.time);
          const tb =
            typeof b.time === 'string' ? Date.parse(b.time) : Number(b.time);
          if (ta !== tb) return ta - tb;
          // If times are equal, bull items (position: 'belowBar') come first
          if (a.position === 'aboveBar' && b.position !== 'aboveBar') return -1;
          if (a.position !== 'aboveBar' && b.position === 'aboveBar') return 1;
          return 0;
        });
        bear = [];
      }
    }

    // --- TD13 COUNTDOWN LOGIC (Pine Script style) ---
    // High/Low trend lines for full stop on TD13
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
    prevBuySet = buySet;
    prevSellSet = sellSet;
    prevBuyCounCC = buyCounCC;
    prevSellCounCC = sellCounCC;
    prevBuyCounCC8Close = buyCounCC8Close;
    prevSellCounCC8Close = sellCounCC8Close;
    prevHighTrendLine = highTrendLine;
    prevLowTrendLine = lowTrendLine;
  }

  return markers;
}

export function buildDMarkMarkers(data: CandlestickData[]): any[] {
  const markers: any[] = [];
  let count = 0;
  let direction: 'bull' | 'bear' | null = null;
  let seqBuffer: any[] = [];
  let waitingForFlip = false;

  for (let i = 4; i < data.length; i++) {
    const close = data[i].close;
    const close4 = data[i - 4].close;

    if (waitingForFlip) {
      if (
        (direction === 'bull' && close < close4) ||
        (direction === 'bear' && close > close4)
      ) {
        waitingForFlip = false;
        direction = null;
        count = 0;
        seqBuffer = [];
        // After flip, fall through to check for new setup on this bar
      } else {
        continue; // Still waiting for flip, skip bar
      }
    }

    if (direction === null) {
      if (close > close4) {
        direction = 'bull';
        count = 1;
        seqBuffer = [
          {
            time: data[i].time,
            position: 'aboveBar',
            color: 'lightblue',
            text: '1',
          },
        ];
      } else if (close < close4) {
        direction = 'bear';
        count = 1;
        seqBuffer = [
          {
            time: data[i].time,
            position: 'belowBar',
            color: 'lightblue',
            text: '1',
          },
        ];
      }
      // If neither, do nothing
    } else if (direction === 'bull') {
      if (close > close4) {
        count++;
        seqBuffer.push({
          time: data[i].time,
          position: 'aboveBar',
          color: count === 9 ? 'deeppink' : 'lightblue',
          text: `${count}`,
          fontWeight: count === 9 ? 'bold' : undefined,
          fontSize: count === 9 ? 20 : undefined,
        });
        if (count === 9) {
          markers.push(...seqBuffer);
          waitingForFlip = true;
        }
      } else {
        // Sequence broken before 9
        direction = null;
        count = 0;
        seqBuffer = [];
        // ---- KEY CHANGE: after break, immediately check if a new sequence starts on this same bar ----
        if (close < close4) {
          direction = 'bear';
          count = 1;
          seqBuffer = [
            {
              time: data[i].time,
              position: 'belowBar',
              color: 'lightblue',
              text: '1',
            },
          ];
        }
      }
    } else if (direction === 'bear') {
      if (close < close4) {
        count++;
        seqBuffer.push({
          time: data[i].time,
          position: 'belowBar',
          color: count === 9 ? 'deeppink' : 'lightblue',
          text: `${count}`,
          fontWeight: count === 9 ? 'bold' : undefined,
          fontSize: count === 9 ? 20 : undefined,
        });
        if (count === 9) {
          markers.push(...seqBuffer);
          waitingForFlip = true;
        }
      } else {
        // Sequence broken before 9
        direction = null;
        count = 0;
        seqBuffer = [];
        // ---- KEY CHANGE: after break, immediately check if a new sequence starts on this same bar ----
        if (close > close4) {
          direction = 'bull';
          count = 1;
          seqBuffer = [
            {
              time: data[i].time,
              position: 'aboveBar',
              color: 'lightblue',
              text: '1',
            },
          ];
        }
      }
    }
  }
  // After the loop ends, handle incomplete setup at right edge:
  if (!waitingForFlip && seqBuffer.length > 0 && count < 9) {
    markers.push(...seqBuffer);
  }
  return markers;
}
