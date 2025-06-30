var f = Object.defineProperty;
var _ = (o, t, s) => t in o ? f(o, t, { enumerable: !0, configurable: !0, writable: !0, value: s }) : o[t] = s;
var p = (o, t, s) => _(o, typeof t != "symbol" ? t + "" : t, s);
import { customSeriesDefaultOptions as m } from "lightweight-charts";
const B = {
  ...m,
  colors: [
    "#2962FF",
    "#E1575A",
    "#F28E2C",
    "rgb(164, 89, 209)",
    "rgb(27, 156, 133)"
  ]
};
function v(o) {
  return Math.floor(o * 0.5);
}
function x(o, t, s = 1, n) {
  const a = Math.round(t * o), c = Math.round(s * t), g = v(c);
  return { position: a - g, length: c };
}
function P(o, t, s) {
  const n = Math.round(s * o), a = Math.round(s * t);
  return {
    position: Math.min(n, a),
    length: Math.abs(a - n) + 1
  };
}
class b {
  constructor() {
    p(this, "_data", null);
    p(this, "_options", null);
  }
  draw(t, s) {
    t.useBitmapCoordinateSpace(
      (n) => this._drawImpl(n, s)
    );
  }
  update(t, s) {
    this._data = t, this._options = s;
  }
  _drawImpl(t, s) {
    if (this._data === null || this._data.bars.length === 0 || this._data.visibleRange === null || this._options === null)
      return;
    const n = this._options, a = this._data.barSpacing, c = this._data.bars.map((i) => {
      const u = i.originalData.values.length, e = a / (u + 1), d = e / 2 + i.x - a / 2 + e / 2;
      return {
        singleBarWidth: e,
        singleBars: i.originalData.values.map((r, l) => ({
          y: s(r) ?? 0,
          color: n.colors[l % n.colors.length],
          x: d + l * e
        }))
      };
    }), g = s(0) ?? 0;
    for (let i = this._data.visibleRange.from; i < this._data.visibleRange.to; i++) {
      const u = c[i];
      let e;
      u.singleBars.forEach((h) => {
        const d = P(
          g,
          h.y,
          t.verticalPixelRatio
        ), r = x(
          h.x,
          t.horizontalPixelRatio,
          u.singleBarWidth
        );
        t.context.beginPath(), t.context.fillStyle = h.color;
        const l = e ? r.position - e : 0;
        t.context.fillRect(
          r.position - l,
          d.position,
          r.length + l,
          d.length
        ), e = r.position + r.length;
      });
    }
  }
}
class R {
  constructor() {
    p(this, "_renderer");
    this._renderer = new b();
  }
  priceValueBuilder(t) {
    return [
      0,
      ...t.values
    ];
  }
  isWhitespace(t) {
    var s;
    return !((s = t.values) != null && s.length);
  }
  renderer() {
    return this._renderer;
  }
  update(t, s) {
    this._renderer.update(t, s);
  }
  defaultOptions() {
    return B;
  }
}
export {
  R as GroupedBarsSeries
};
