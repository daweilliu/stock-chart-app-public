var h = Object.defineProperty;
var c = (i, t, a) => t in i ? h(i, t, { enumerable: !0, configurable: !0, writable: !0, value: a }) : i[t] = a;
var e = (i, t, a) => c(i, typeof t != "symbol" ? t + "" : t, a);
import { CrosshairMode as l } from "lightweight-charts";
function d(i) {
  return Math.floor(i * 0.5);
}
function u(i, t, a = 1, s) {
  const r = Math.round(t * i), o = Math.round(a * t), n = d(o);
  return { position: r - n, length: o };
}
class _ {
  constructor(t) {
    e(this, "_data");
    this._data = t;
  }
  draw(t) {
    this._data.visible && t.useBitmapCoordinateSpace((a) => {
      const s = a.context, r = u(
        this._data.x,
        a.horizontalPixelRatio,
        Math.max(1, this._data.barSpacing)
      );
      s.fillStyle = this._data.color, s.fillRect(
        r.position,
        0,
        r.length,
        a.bitmapSize.height
      );
    });
  }
}
class p {
  constructor(t) {
    e(this, "_data");
    this._data = t;
  }
  update(t) {
    this._data = t;
  }
  renderer() {
    return new _(this._data);
  }
  zOrder() {
    return "bottom";
  }
}
const g = {
  color: "rgba(0, 0, 0, 0.2)"
};
class v {
  constructor(t) {
    e(this, "_options");
    e(this, "_paneViews");
    e(this, "_data", {
      x: 0,
      visible: !1,
      color: "rgba(0, 0, 0, 0.2)",
      barSpacing: 6
    });
    e(this, "_attachedParams");
    e(this, "_moveHandler", (t) => this._onMouseMove(t));
    this._options = {
      ...g,
      ...t
    }, this._paneViews = [new p(this._data)];
  }
  attached(t) {
    this._attachedParams = t, this._setCrosshairMode(), t.chart.subscribeCrosshairMove(this._moveHandler);
  }
  detached() {
    const t = this.chart();
    t && t.unsubscribeCrosshairMove(this._moveHandler);
  }
  paneViews() {
    return this._paneViews;
  }
  updateAllViews() {
    this._paneViews.forEach((t) => t.update(this._data));
  }
  setData(t) {
    var a;
    this._data = t, this.updateAllViews(), (a = this._attachedParams) == null || a.requestUpdate();
  }
  currentColor() {
    return this._options.color;
  }
  chart() {
    var t;
    return (t = this._attachedParams) == null ? void 0 : t.chart;
  }
  // We need to disable magnet mode for this to work nicely
  _setCrosshairMode() {
    const t = this.chart();
    if (!t)
      throw new Error(
        "Unable to change crosshair mode because the chart instance is undefined"
      );
    t.applyOptions({
      crosshair: {
        mode: l.Normal,
        vertLine: {
          visible: !1
        }
      }
    });
  }
  _barSpacing() {
    const t = this.chart();
    if (!t) return 6;
    const a = t.timeScale(), s = a.getVisibleLogicalRange();
    return s ? a.width() / (s.to - s.from) : 6;
  }
  _onMouseMove(t) {
    const a = this.chart(), s = t.logical;
    if (!s || !a) {
      this.setData({
        x: 0,
        visible: !1,
        color: this.currentColor(),
        barSpacing: this._barSpacing()
      });
      return;
    }
    const r = a.timeScale().logicalToCoordinate(s);
    this.setData({
      x: r ?? 0,
      visible: r !== null,
      color: this.currentColor(),
      barSpacing: this._barSpacing()
    });
  }
}
export {
  v as CrosshairHighlightPrimitive
};
