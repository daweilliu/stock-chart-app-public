import { CanvasRenderingTarget2D } from 'fancy-canvas';
import {
  Coordinate,
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  ISeriesPrimitiveAxisView,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  SeriesOptionsMap,
  SeriesType,
  Time,
} from 'lightweight-charts';

function positionsLine(
  x: Coordinate,
  pixelRatio: number,
  width: number
): { position: number; length: number } {
  const halfWidth = Math.floor(width * pixelRatio * 0.5);
  return {
    position: Math.round(x * pixelRatio) - halfWidth,
    length: width * pixelRatio,
  };
}

class VertLinePaneRenderer implements IPrimitivePaneRenderer {
  _x: Coordinate | null = null;
  _options: VertLineOptions;
  constructor(x: Coordinate | null, options: VertLineOptions) {
    this._x = x;
    this._options = options;
  }
  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace((scope) => {
      if (this._x === null) return;
      const ctx = scope.context;
      const position = positionsLine(
        this._x,
        scope.horizontalPixelRatio,
        this._options.width
      );

      // Draw dashed line if specified
      if (this._options.lineStyle === 'dashed') {
        ctx.setLineDash([10, 5]); // 10px dash, 5px gap
        ctx.strokeStyle = this._options.color;
        ctx.lineWidth = this._options.width;
        ctx.beginPath();
        ctx.moveTo(position.position + position.length / 2, 0);
        ctx.lineTo(
          position.position + position.length / 2,
          scope.bitmapSize.height
        );
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
      } else {
        // Solid line (original implementation)
        ctx.fillStyle = this._options.color;
        ctx.fillRect(
          position.position,
          0,
          position.length,
          scope.bitmapSize.height
        );
      }
    });
  }
}

class VertLinePaneView implements IPrimitivePaneView {
  _source: VertLine;
  _x: Coordinate | null = null;
  _options: VertLineOptions;

  constructor(source: VertLine, options: VertLineOptions) {
    this._source = source;
    this._options = options;
  }
  update() {
    const timeScale = this._source._chart.timeScale();
    this._x = timeScale.timeToCoordinate(this._source._time);
  }
  renderer() {
    return new VertLinePaneRenderer(this._x, this._options);
  }
}

class VertLineTimeAxisView implements ISeriesPrimitiveAxisView {
  _source: VertLine;
  _x: Coordinate | null = null;
  _options: VertLineOptions;

  constructor(source: VertLine, options: VertLineOptions) {
    this._source = source;
    this._options = options;
  }
  update() {
    const timeScale = this._source._chart.timeScale();
    this._x = timeScale.timeToCoordinate(this._source._time);
  }
  visible() {
    return this._options.showLabel;
  }
  tickVisible() {
    return this._options.showLabel;
  }
  coordinate() {
    return this._x ?? 0;
  }
  text() {
    return this._options.labelText;
  }
  textColor() {
    return this._options.labelTextColor;
  }
  backColor() {
    return this._options.labelBackgroundColor;
  }
}

export interface VertLineOptions {
  color: string;
  labelText: string;
  width: number;
  labelBackgroundColor: string;
  labelTextColor: string;
  showLabel: boolean;
  lineStyle?: 'solid' | 'dashed';
}

const defaultOptions: VertLineOptions = {
  color: 'rgba(255, 255, 255, 0.8)',
  labelText: '',
  width: 2,
  labelBackgroundColor: 'white',
  labelTextColor: 'black',
  showLabel: false,
  lineStyle: 'dashed',
};

export class VertLine implements ISeriesPrimitive<Time> {
  _chart: IChartApi;
  _series: ISeriesApi<keyof SeriesOptionsMap>;
  _time: Time;
  _paneViews: VertLinePaneView[];
  _timeAxisViews: VertLineTimeAxisView[];

  constructor(
    chart: IChartApi,
    series: ISeriesApi<SeriesType>,
    time: Time,
    options?: Partial<VertLineOptions>
  ) {
    const vertLineOptions: VertLineOptions = {
      ...defaultOptions,
      ...options,
    };
    this._chart = chart;
    this._series = series;
    this._time = time;
    this._paneViews = [new VertLinePaneView(this, vertLineOptions)];
    this._timeAxisViews = [new VertLineTimeAxisView(this, vertLineOptions)];
  }
  updateAllViews() {
    this._paneViews.forEach((pw) => pw.update());
    this._timeAxisViews.forEach((tw) => tw.update());
  }
  timeAxisViews() {
    return this._timeAxisViews;
  }
  paneViews() {
    return this._paneViews;
  }
}
