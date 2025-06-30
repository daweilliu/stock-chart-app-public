var l = Object.defineProperty;
var a = (s, t, i) =>
  t in s
    ? l(s, t, { enumerable: !0, configurable: !0, writable: !0, value: i })
    : (s[t] = i);
var e = (s, t, i) => a(s, typeof t != "symbol" ? t + "" : t, i);

function c(s) {
  return Math.floor(s * 0.5);
}

function _(s, t, i = 1, n) {
  const o = Math.round(t * s),
    r = Math.round(i * t),
    h = c(r);
  return { position: o - h, length: r };
}

class u {
  constructor(t, i) {
    e(this, "_x", null);
    e(this, "_options");
    (this._x = t), (this._options = i);
  }

  draw(t) {
    t.useBitmapCoordinateSpace((i) => {
      if (this._x === null) return;
      const n = i.context,
        o = _(this._x, i.horizontalPixelRatio, this._options.width);

      n.strokeStyle = this._options.color;
      n.lineWidth = this._options.width;

      // Set up dashed line pattern
      if (this._options.dashed) {
        n.setLineDash([
          this._options.dashLength || 5,
          this._options.dashGap || 3,
        ]);
      } else {
        n.setLineDash([]);
      }

      n.beginPath();
      n.moveTo(o.position + o.length / 2, 0);
      n.lineTo(o.position + o.length / 2, i.bitmapSize.height);
      n.stroke();
    });
  }
}

class p {
  constructor(t, i) {
    e(this, "_source");
    e(this, "_x", null);
    e(this, "_options");
    (this._source = t), (this._options = i);
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
    (this._source = t), (this._options = i);
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

// Default options for white dashed vertical line
const w = {
  color: "rgba(255, 255, 255, 0.8)", // White with slight transparency
  labelText: "",
  width: 1, // Thin line
  labelBackgroundColor: "rgba(0, 0, 0, 0.7)",
  labelTextColor: "white",
  showLabel: false,
  dashed: true, // Enable dashed line
  dashLength: 4,
  dashGap: 3,
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
      ...o,
    };
    (this._chart = t),
      (this._series = i),
      (this._time = n),
      (this._paneViews = [new p(this, r)]),
      (this._timeAxisViews = [new x(this, r)]);
  }

  updateAllViews() {
    this._paneViews.forEach((t) => t.update()),
      this._timeAxisViews.forEach((t) => t.update());
  }

  timeAxisViews() {
    return this._timeAxisViews;
  }

  paneViews() {
    return this._paneViews;
  }
}

export { V as DashedVertLine };

// Also make it available globally for dynamic loading
if (typeof window !== "undefined") {
  window.DashedVertLine = V;
  window.DashedVerticalLine = V;
}
