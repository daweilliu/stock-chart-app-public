var w = Object.defineProperty;
var v = (s, t, e) => t in s ? w(s, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : s[t] = e;
var g = (s, t, e) => v(s, typeof t != "symbol" ? t + "" : t, e);
import { customSeriesDefaultOptions as L } from "lightweight-charts";
const P = {
  ...L,
  highLineColor: "#049981",
  lowLineColor: "#F23645",
  closeLineColor: "#878993",
  areaBottomColor: "rgba(242, 54, 69, 0.2)",
  areaTopColor: "rgba(4, 153, 129, 0.2)",
  highLineWidth: 2,
  lowLineWidth: 2,
  closeLineWidth: 2
};
class m {
  constructor() {
    g(this, "_data", null);
    g(this, "_options", null);
  }
  draw(t, e) {
    t.useBitmapCoordinateSpace(
      (l) => this._drawImpl(l, e)
    );
  }
  update(t, e) {
    this._data = t, this._options = e;
  }
  _drawImpl(t, e) {
    if (this._data === null || this._data.bars.length === 0 || this._data.visibleRange === null || this._options === null)
      return;
    const l = this._options, u = this._data.bars.map((o) => ({
      x: o.x * t.horizontalPixelRatio,
      high: e(o.originalData.high) * t.verticalPixelRatio,
      low: e(o.originalData.low) * t.verticalPixelRatio,
      close: e(o.originalData.close) * t.verticalPixelRatio
    })), i = t.context;
    i.beginPath();
    const x = new Path2D(), _ = new Path2D(), h = new Path2D(), a = u[this._data.visibleRange.from];
    x.moveTo(a.x, a.low), _.moveTo(a.x, a.high);
    for (let o = this._data.visibleRange.from + 1; o < this._data.visibleRange.to; o++) {
      const n = u[o];
      x.lineTo(n.x, n.low), _.lineTo(n.x, n.high);
    }
    const r = u[this._data.visibleRange.to - 1];
    h.moveTo(r.x, r.close);
    for (let o = this._data.visibleRange.to - 2; o >= this._data.visibleRange.from; o--) {
      const n = u[o];
      h.lineTo(n.x, n.close);
    }
    const c = new Path2D(_);
    c.lineTo(r.x, r.close), c.addPath(h), c.lineTo(a.x, a.high), c.closePath(), i.fillStyle = l.areaTopColor, i.fill(c);
    const d = new Path2D(x);
    d.lineTo(r.x, r.close), d.addPath(h), d.lineTo(a.x, a.low), d.closePath(), i.fillStyle = l.areaBottomColor, i.fill(d), i.lineJoin = "round", i.strokeStyle = l.lowLineColor, i.lineWidth = l.lowLineWidth * t.verticalPixelRatio, i.stroke(x), i.strokeStyle = l.highLineColor, i.lineWidth = l.highLineWidth * t.verticalPixelRatio, i.stroke(_), i.strokeStyle = l.closeLineColor, i.lineWidth = l.closeLineWidth * t.verticalPixelRatio, i.stroke(h);
  }
}
class R {
  constructor() {
    g(this, "_renderer");
    this._renderer = new m();
  }
  priceValueBuilder(t) {
    return [t.low, t.high, t.close];
  }
  isWhitespace(t) {
    return t.close === void 0;
  }
  renderer() {
    return this._renderer;
  }
  update(t, e) {
    this._renderer.update(t, e);
  }
  defaultOptions() {
    return P;
  }
}
export {
  R as HLCAreaSeries
};
