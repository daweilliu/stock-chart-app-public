var l = Object.defineProperty;
var a = (s, t, i) => t in s ? l(s, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : s[t] = i;
var e = (s, t, i) => a(s, typeof t != "symbol" ? t + "" : t, i);
function c(s) {
  return Math.floor(s * 0.5);
}
function _(s, t, i = 1, n) {
  const o = Math.round(t * s), r = Math.round(i * t), h = c(r);
  return { position: o - h, length: r };
}
class u {
  constructor(t, i) {
    e(this, "_x", null);
    e(this, "_options");
    this._x = t, this._options = i;
  }
  draw(t) {
    t.useBitmapCoordinateSpace((i) => {
      if (this._x === null) return;
      const n = i.context, o = _(
        this._x,
        i.horizontalPixelRatio,
        this._options.width
      );
      n.fillStyle = this._options.color, n.fillRect(
        o.position,
        0,
        o.length,
        i.bitmapSize.height
      );
    });
  }
}
class p {
  constructor(t, i) {
    e(this, "_source");
    e(this, "_x", null);
    e(this, "_options");
    this._source = t, this._options = i;
  }
  update() {
    const t = this._source._chart.timeScale();
    this._x = t.timeToCoordinate(this._source._time);
  }
  renderer() {
    return new u(this._x, this._options);
  }
}
class x {
  constructor(t, i) {
    e(this, "_source");
    e(this, "_x", null);
    e(this, "_options");
    this._source = t, this._options = i;
  }
  update() {
    const t = this._source._chart.timeScale();
    this._x = t.timeToCoordinate(this._source._time);
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
const w = {
  color: "green",
  labelText: "",
  width: 3,
  labelBackgroundColor: "green",
  labelTextColor: "white",
  showLabel: !1
};
class V {
  constructor(t, i, n, o) {
    e(this, "_chart");
    e(this, "_series");
    e(this, "_time");
    e(this, "_paneViews");
    e(this, "_timeAxisViews");
    const r = {
      ...w,
      ...o
    };
    this._chart = t, this._series = i, this._time = n, this._paneViews = [new p(this, r)], this._timeAxisViews = [new x(this, r)];
  }
  updateAllViews() {
    this._paneViews.forEach((t) => t.update()), this._timeAxisViews.forEach((t) => t.update());
  }
  timeAxisViews() {
    return this._timeAxisViews;
  }
  paneViews() {
    return this._paneViews;
  }
}
export {
  V as VertLine
};
