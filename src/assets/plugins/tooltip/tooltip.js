var v = Object.defineProperty;
var g = (e, t, i) => t in e ? v(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[t] = i;
var n = (e, t, i) => g(e, typeof t != "symbol" ? t + "" : t, i);
import { isUTCTimestamp as x, isBusinessDay as b, CrosshairMode as E } from "lightweight-charts";
const y = {
  title: "",
  followMode: "tracking",
  horizontalDeadzoneWidth: 45,
  verticalDeadzoneHeight: 100,
  verticalSpacing: 20,
  topOffset: 20
};
class w {
  constructor(t, i) {
    n(this, "_chart");
    n(this, "_element");
    n(this, "_titleElement");
    n(this, "_priceElement");
    n(this, "_dateElement");
    n(this, "_timeElement");
    n(this, "_options");
    n(this, "_lastTooltipWidth", null);
    this._options = {
      ...y,
      ...i
    }, this._chart = t;
    const o = document.createElement("div");
    d(o, {
      display: "flex",
      "flex-direction": "column",
      "align-items": "center",
      position: "absolute",
      transform: "translate(calc(0px - 50%), 0px)",
      opacity: "0",
      left: "0%",
      top: "0",
      "z-index": "100",
      "background-color": "white",
      "border-radius": "4px",
      padding: "5px 10px",
      "font-family": "-apple-system, BlinkMacSystemFont, 'Trebuchet MS', Roboto, Ubuntu, sans-serif",
      "font-size": "12px",
      "font-weight": "400",
      "box-shadow": "0px 2px 4px rgba(0, 0, 0, 0.2)",
      "line-height": "16px",
      "pointer-events": "none",
      color: "#131722"
    });
    const s = document.createElement("div");
    d(s, {
      "font-size": "16px",
      "line-height": "24px",
      "font-weight": "590"
    }), h(s, this._options.title), o.appendChild(s);
    const a = document.createElement("div");
    d(a, {
      "font-size": "14px",
      "line-height": "18px",
      "font-weight": "590"
    }), h(a, ""), o.appendChild(a);
    const r = document.createElement("div");
    d(r, {
      color: "#787B86"
    }), h(r, ""), o.appendChild(r);
    const l = document.createElement("div");
    d(l, {
      color: "#787B86"
    }), h(l, ""), o.appendChild(l), this._element = o, this._titleElement = s, this._priceElement = a, this._dateElement = r, this._timeElement = l;
    const c = this._chart.chartElement();
    c.appendChild(this._element);
    const _ = c.parentElement;
    if (!_) {
      console.error("Chart Element is not attached to the page.");
      return;
    }
    const p = getComputedStyle(_).position;
    p !== "relative" && p !== "absolute" && console.error("Chart Element position is expected be `relative` or `absolute`.");
  }
  destroy() {
    this._chart && this._element && this._chart.chartElement().removeChild(this._element);
  }
  applyOptions(t) {
    this._options = {
      ...this._options,
      ...t
    };
  }
  options() {
    return this._options;
  }
  updateTooltipContent(t) {
    if (!this._element) return;
    const i = this._element.getBoundingClientRect();
    this._lastTooltipWidth = i.width, t.title !== void 0 && this._titleElement && h(this._titleElement, t.title), h(this._priceElement, t.price), h(this._dateElement, t.date), h(this._timeElement, t.time);
  }
  updatePosition(t) {
    if (!this._chart || !this._element || (this._element.style.opacity = t.visible ? "1" : "0", !t.visible))
      return;
    const i = this._calculateXPosition(t, this._chart), o = this._calculateYPosition(t);
    this._element.style.transform = `translate(${i}, ${o})`;
  }
  _calculateXPosition(t, i) {
    const o = t.paneX + i.priceScale("left").width(), s = this._lastTooltipWidth ? Math.ceil(this._lastTooltipWidth / 2) : this._options.horizontalDeadzoneWidth;
    return `calc(${Math.min(
      Math.max(s, o),
      i.timeScale().width() - s
    )}px - 50%)`;
  }
  _calculateYPosition(t) {
    if (this._options.followMode == "top")
      return `${this._options.topOffset}px`;
    const i = t.paneY, o = i <= this._options.verticalSpacing + this._options.verticalDeadzoneHeight;
    return `calc(${i + (o ? 1 : -1) * this._options.verticalSpacing}px${o ? "" : " - 100%"})`;
  }
}
function h(e, t) {
  !e || t === e.innerText || (e.innerText = t, e.style.display = t ? "block" : "none");
}
function d(e, t) {
  for (const [i, o] of Object.entries(t))
    e.style.setProperty(i, o);
}
function C(e) {
  if (x(e)) return e * 1e3;
  if (b(e)) return new Date(e.year, e.month, e.day).valueOf();
  const [t, i, o] = e.split("-").map(parseInt);
  return new Date(t, i, o).valueOf();
}
function M(e) {
  if (!e) return ["", ""];
  const t = new Date(e), i = t.getFullYear(), o = t.toLocaleString("default", { month: "short" }), a = `${t.getDate().toString().padStart(2, "0")} ${o} ${i}`, r = t.getHours().toString().padStart(2, "0"), l = t.getMinutes().toString().padStart(2, "0"), c = `${r}:${l}`;
  return [a, c];
}
function T(e) {
  return Math.floor(e * 0.5);
}
function P(e, t, i = 1, o) {
  const s = Math.round(t * e), a = Math.round(i * t), r = T(a);
  return { position: s - r, length: a };
}
class S {
  constructor(t) {
    n(this, "_data");
    this._data = t;
  }
  draw(t) {
    this._data.visible && t.useBitmapCoordinateSpace((i) => {
      const o = i.context, s = P(
        this._data.x,
        i.horizontalPixelRatio,
        1
      );
      o.fillStyle = this._data.color, o.fillRect(
        s.position,
        this._data.topMargin * i.verticalPixelRatio,
        s.length,
        i.bitmapSize.height
      );
    });
  }
}
class O {
  constructor(t) {
    n(this, "_data");
    this._data = t;
  }
  update(t) {
    this._data = t;
  }
  renderer() {
    return new S(this._data);
  }
  zOrder() {
    return "bottom";
  }
}
const z = {
  lineColor: "rgba(0, 0, 0, 0.2)",
  priceExtractor: (e) => e.value !== void 0 ? e.value.toFixed(2) : e.close !== void 0 ? e.close.toFixed(2) : ""
};
class B {
  constructor(t) {
    n(this, "_options");
    n(this, "_tooltip");
    n(this, "_paneViews");
    n(this, "_data", {
      x: 0,
      visible: !1,
      color: "rgba(0, 0, 0, 0.2)",
      topMargin: 0
    });
    n(this, "_attachedParams");
    n(this, "_moveHandler", (t) => this._onMouseMove(t));
    this._options = {
      ...z,
      ...t
    }, this._paneViews = [new O(this._data)];
  }
  attached(t) {
    this._attachedParams = t, this._setCrosshairMode(), t.chart.subscribeCrosshairMove(this._moveHandler), this._createTooltipElement();
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
    var i;
    this._data = t, this.updateAllViews(), (i = this._attachedParams) == null || i.requestUpdate();
  }
  currentColor() {
    return this._options.lineColor;
  }
  chart() {
    var t;
    return (t = this._attachedParams) == null ? void 0 : t.chart;
  }
  series() {
    var t;
    return (t = this._attachedParams) == null ? void 0 : t.series;
  }
  applyOptions(t) {
    this._options = {
      ...this._options,
      ...t
    }, this._tooltip && this._tooltip.applyOptions({ ...this._options.tooltip });
  }
  _setCrosshairMode() {
    const t = this.chart();
    if (!t)
      throw new Error(
        "Unable to change crosshair mode because the chart instance is undefined"
      );
    t.applyOptions({
      crosshair: {
        mode: E.Magnet,
        vertLine: {
          visible: !1,
          labelVisible: !1
        },
        horzLine: {
          visible: !1,
          labelVisible: !1
        }
      }
    });
  }
  _hideTooltip() {
    this._tooltip && (this._tooltip.updateTooltipContent({
      title: "",
      price: "",
      date: "",
      time: ""
    }), this._tooltip.updatePosition({
      paneX: 0,
      paneY: 0,
      visible: !1
    }));
  }
  _hideCrosshair() {
    this._hideTooltip(), this.setData({
      x: 0,
      visible: !1,
      color: this.currentColor(),
      topMargin: 0
    });
  }
  _onMouseMove(t) {
    var p, u;
    const i = this.chart(), o = this.series(), s = t.logical;
    if (!s || !i || !o) {
      this._hideCrosshair();
      return;
    }
    const a = t.seriesData.get(o);
    if (!a) {
      this._hideCrosshair();
      return;
    }
    const r = this._options.priceExtractor(a), l = i.timeScale().logicalToCoordinate(s), [c, _] = M(t.time ? C(t.time) : void 0);
    if (this._tooltip) {
      const m = this._tooltip.options(), f = m.followMode == "top" ? m.topOffset + 10 : 0;
      this.setData({
        x: l ?? 0,
        visible: l !== null,
        color: this.currentColor(),
        topMargin: f
      }), this._tooltip.updateTooltipContent({
        price: r,
        date: c,
        time: _
      }), this._tooltip.updatePosition({
        paneX: ((p = t.point) == null ? void 0 : p.x) ?? 0,
        paneY: ((u = t.point) == null ? void 0 : u.y) ?? 0,
        visible: !0
      });
    }
  }
  _createTooltipElement() {
    const t = this.chart();
    if (!t)
      throw new Error("Unable to create Tooltip element. Chart not attached");
    this._tooltip = new w(t, {
      ...this._options.tooltip
    });
  }
}
export {
  B as TooltipPrimitive
};
