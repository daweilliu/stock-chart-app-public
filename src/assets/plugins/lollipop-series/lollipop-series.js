var _ = Object.defineProperty;
var f = (o, t, i) => t in o ? _(o, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : o[t] = i;
var r = (o, t, i) => f(o, typeof t != "symbol" ? t + "" : t, i);
import { customSeriesDefaultOptions as x } from "lightweight-charts";
const m = {
  ...x,
  lineWidth: 2
};
function P(o) {
  return Math.floor(o * 0.5);
}
function b(o, t, i = 1, s) {
  const a = Math.round(t * o), e = Math.round(i * t), h = P(e);
  return { position: a - h, length: e };
}
function M(o, t, i) {
  const s = Math.round(i * o), a = Math.round(i * t);
  return {
    position: Math.min(s, a),
    length: Math.abs(a - s) + 1
  };
}
class v {
  constructor() {
    r(this, "_data", null);
    r(this, "_options", null);
  }
  draw(t, i) {
    t.useBitmapCoordinateSpace(
      (s) => this._drawImpl(s, i)
    );
  }
  update(t, i) {
    this._data = t, this._options = i;
  }
  _drawImpl(t, i) {
    if (this._data === null || this._data.bars.length === 0 || this._data.visibleRange === null || this._options === null)
      return;
    const s = this._options, a = this._data.bars.map((n) => ({
      x: n.x,
      y: i(n.originalData.value) ?? 0
    })), e = Math.min(this._options.lineWidth, this._data.barSpacing), h = this._data.barSpacing, u = Math.floor(h / 2), p = i(0);
    for (let n = this._data.visibleRange.from; n < this._data.visibleRange.to; n++) {
      const l = a[n], c = b(
        l.x,
        t.horizontalPixelRatio,
        e
      ), d = M(
        p ?? 0,
        l.y,
        t.verticalPixelRatio
      );
      t.context.beginPath(), t.context.fillStyle = s.color, t.context.fillRect(
        c.position,
        d.position,
        c.length,
        d.length
      ), t.context.arc(
        l.x * t.horizontalPixelRatio,
        l.y * t.verticalPixelRatio,
        u * t.horizontalPixelRatio,
        0,
        Math.PI * 2
      ), t.context.fill();
    }
  }
}
class W {
  constructor() {
    r(this, "_renderer");
    this._renderer = new v();
  }
  priceValueBuilder(t) {
    return [0, t.value];
  }
  isWhitespace(t) {
    return t.value === void 0;
  }
  renderer() {
    return this._renderer;
  }
  update(t, i) {
    this._renderer.update(t, i);
  }
  defaultOptions() {
    return m;
  }
}
export {
  W as LollipopSeries
};
